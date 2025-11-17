import Avaliacao from "../models/Avaliacao.js";
import Inscricao from "../models/Inscricao.js";
import ResumoAvaliacao from "../models/ResumoAvaliacao.js";
import { gerarResumoAvaliacoes } from "../services/geminiAPI.js";
import mongoose from 'mongoose';

class AvaliacaoController {
    
    static async criarAvaliacao(req, res) {
        try {
            const { usuarioId, cursoId, nota, mensagem, comentario } = req.body;
            const textoAvaliacao = mensagem || comentario;

            if (!usuarioId || !cursoId || !nota) {
                return res.status(400).json({ message: 'Campos obrigatórios: usuarioId, cursoId e nota.' });
            }

            if (!mongoose.Types.ObjectId.isValid(cursoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
                return res.status(400).json({ message: 'IDs inválidos.' });
            }

            if (nota < 1 || nota > 5) {
                return res.status(400).json({ message: 'A nota deve estar entre 1 e 5.' });
            }

            const inscricao = await Inscricao.findByUserAndCourse(usuarioId, cursoId);
            
            if (!inscricao) {
                return res.status(403).json({ 
                    message: 'Você precisa estar inscrito no curso para avaliá-lo.' 
                });
            }

            if (inscricao.status !== 'Concluido') {
                return res.status(403).json({ 
                    message: 'Você precisa concluir o curso para avaliá-lo.' 
                });
            }

            const avaliacaoExistente = await Avaliacao.findByUserAndCourse(usuarioId, cursoId);
            if (avaliacaoExistente) {
                return res.status(409).json({ 
                    message: 'Você já avaliou este curso.' 
                });
            }

            const novaAvaliacao = new Avaliacao(usuarioId, cursoId, nota, textoAvaliacao || '');
            await novaAvaliacao.save();

            try {
                await AvaliacaoController.gerarResumoIA(cursoId);
            } catch (error) {
                console.error('Erro ao gerar resumo de avaliações:', error);
            }

            res.status(201).json({ 
                message: 'Avaliação criada com sucesso!',
                avaliacao: novaAvaliacao
            });

        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({ message: 'Erro interno ao processar a avaliação.' });
        }
    }

    static async buscarAvaliacoesCurso(req, res) {
        try {
            const { cursoId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cursoId)) {
                return res.status(400).json({ message: 'ID do curso inválido.' });
            }

            const resumoCache = await ResumoAvaliacao.findByCurso(cursoId);

            const avaliacoes = await Avaliacao.findByCourse(cursoId);
            const { media, total } = await Avaliacao.getMediaByCourse(cursoId);

            res.json({
                avaliacoes,
                media,
                total,
                resumo: resumoCache ? {
                    texto: resumoCache.resumoIA,
                    totalAvaliacoes: resumoCache.totalAvaliacoes,
                    mediaNotas: resumoCache.mediaNotas,
                    distribuicaoNotas: resumoCache.distribuicaoNotas,
                    ultimaAtualizacao: resumoCache.ultimaAtualizacao
                } : null
            });

        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            res.status(500).json({ message: 'Erro interno ao buscar avaliações.' });
        }
    }

    static async verificarAvaliacao(req, res) {
        try {
            const { cursoId, usuarioId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cursoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
                return res.status(400).json({ message: 'IDs inválidos.' });
            }

            const avaliacao = await Avaliacao.findByUserAndCourse(usuarioId, cursoId);
            
            res.json({
                jaAvaliou: !!avaliacao,
                avaliacao: avaliacao || null
            });

        } catch (error) {
            console.error('Erro ao verificar avaliação:', error);
            res.status(500).json({ message: 'Erro interno ao verificar avaliação.' });
        }
    }

    static async toggleOcultarAvaliacao(req, res) {
        try {
            const { id } = req.params;
            const { oculta } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID da avaliação inválido.' });
            }

            const avaliacaoAtualizada = await Avaliacao.toggleVisibility(id, oculta);
            
            if (!avaliacaoAtualizada) {
                return res.status(404).json({ message: 'Avaliação não encontrada.' });
            }

            // Regenerar resumo IA após ocultar/mostrar avaliação
            try {
                await AvaliacaoController.gerarResumoIA(avaliacaoAtualizada.cursoId);
            } catch (error) {
                console.error('Erro ao regenerar resumo de avaliações:', error);
            }

            res.json({
                message: oculta ? 'Avaliação ocultada com sucesso.' : 'Avaliação visível novamente.',
                avaliacao: avaliacaoAtualizada
            });

        } catch (error) {
            console.error('Erro ao ocultar avaliação:', error);
            res.status(500).json({ message: 'Erro ao ocultar avaliação.', error: error.message });
        }
    }

    static async gerarResumoIA(cursoId) {
        try {
            // Buscar apenas avaliações não ocultas
            const avaliacoes = await Avaliacao.findByCourse(cursoId, false);

            // Se não houver avaliações visíveis, deletar o resumo
            if (!avaliacoes || avaliacoes.length === 0) {
                await ResumoAvaliacao.delete(cursoId);
                console.log(`Resumo deletado para curso ${cursoId} (sem avaliações visíveis)`);
                return;
            }

            const totalAvaliacoes = avaliacoes.length;
            const somaNotas = avaliacoes.reduce((sum, av) => sum + av.nota, 0);
            const mediaNotas = somaNotas / totalAvaliacoes;
            const distribuicaoNotas = {
                nota1: avaliacoes.filter(av => av.nota === 1).length,
                nota2: avaliacoes.filter(av => av.nota === 2).length,
                nota3: avaliacoes.filter(av => av.nota === 3).length,
                nota4: avaliacoes.filter(av => av.nota === 4).length,
                nota5: avaliacoes.filter(av => av.nota === 5).length
            };

            const resumoIA = await gerarResumoAvaliacoes(avaliacoes);

            const resumo = new ResumoAvaliacao(
                cursoId,
                resumoIA,
                totalAvaliacoes,
                mediaNotas,
                distribuicaoNotas
            );
            await resumo.save();

            console.log(`Resumo de avaliações gerado para curso ${cursoId}`);
        } catch (error) {
            console.error('Erro ao gerar resumo de avaliações:', error);
            throw error;
        }
    }
}

export default AvaliacaoController;

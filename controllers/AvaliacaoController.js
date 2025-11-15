import Avaliacao from "../models/Avaliacao.js";
import Inscricao from "../models/Inscricao.js";
import mongoose from 'mongoose';

class AvaliacaoController {
    
    // POST /api/avaliacoes - Criar avaliação
    static async criarAvaliacao(req, res) {
        try {
            const { usuarioId, cursoId, nota, mensagem } = req.body;

            // Validações
            if (!usuarioId || !cursoId || !nota || !mensagem) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
            }

            if (!mongoose.Types.ObjectId.isValid(cursoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
                return res.status(400).json({ message: 'IDs inválidos.' });
            }

            if (nota < 1 || nota > 5) {
                return res.status(400).json({ message: 'A nota deve estar entre 1 e 5.' });
            }

            // Verificar se o usuário concluiu o curso
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

            // Verificar se já avaliou
            const avaliacaoExistente = await Avaliacao.findByUserAndCourse(usuarioId, cursoId);
            if (avaliacaoExistente) {
                return res.status(409).json({ 
                    message: 'Você já avaliou este curso.' 
                });
            }

            // Criar avaliação
            const novaAvaliacao = new Avaliacao(usuarioId, cursoId, nota, mensagem);
            await novaAvaliacao.save();

            res.status(201).json({ 
                message: 'Avaliação criada com sucesso!',
                avaliacao: novaAvaliacao
            });

        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({ message: 'Erro interno ao processar a avaliação.' });
        }
    }

    // GET /api/avaliacoes/curso/:cursoId - Buscar avaliações de um curso
    static async buscarAvaliacoesCurso(req, res) {
        try {
            const { cursoId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(cursoId)) {
                return res.status(400).json({ message: 'ID do curso inválido.' });
            }

            const avaliacoes = await Avaliacao.findByCourse(cursoId);
            const { media, total } = await Avaliacao.getMediaByCourse(cursoId);

            res.json({
                avaliacoes,
                media,
                total
            });

        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            res.status(500).json({ message: 'Erro interno ao buscar avaliações.' });
        }
    }

    // GET /api/avaliacoes/verificar/:cursoId/:usuarioId - Verificar se usuário já avaliou
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

    // PATCH /api/avaliacoes/:id/ocultar - Ocultar/mostrar avaliação (admin/professor)
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

            res.json({
                message: oculta ? 'Avaliação ocultada com sucesso.' : 'Avaliação visível novamente.',
                avaliacao: avaliacaoAtualizada
            });

        } catch (error) {
            console.error('Erro ao ocultar/mostrar avaliação:', error);
            res.status(500).json({ message: 'Erro interno ao processar a solicitação.' });
        }
    }
}

export default AvaliacaoController;

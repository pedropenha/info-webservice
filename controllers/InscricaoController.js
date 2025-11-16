import Inscricao from "../models/Inscricao.js";
import Curso from "../models/Curso.js"; 
import InscricaoModel from "../Schemas/InscricaoSchema.js"; 
import mongoose from 'mongoose';

class InscricaoController {

   static normalizarProficiencia(texto) {
        if (!texto) return '';
        return texto.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
    }

static async checarPreRequisitos(cursoPreRequisitos, usuarioProficiencias) {
        
        const requisitoBaseNormalizado = InscricaoController.normalizarProficiencia(cursoPreRequisitos); 
        

        if (!cursoPreRequisitos || requisitoBaseNormalizado === 'nenhum') { 
            return { status: true, mensagem: "Pré-requisitos atendidos." };
        }
        
        // Processamento e Normalização para Requisitos Reais
        const requisitosNormalizadosSet = new Set(
            (cursoPreRequisitos || '') // Usa o input original
                .split(',')
                .map(req => InscricaoController.normalizarProficiencia(req)) 
                .filter(r => r.length > 0 && r !== 'nenhum') 
        );

        // Se após a filtragem não houver mais requisitos
        if (requisitosNormalizadosSet.size === 0) {
            return { status: true, mensagem: "Pré-requisitos atendidos." };
        }

        // Normaliza as proficiências do usuário
        const usuarioSkillsNormalizadas = new Set(
            usuarioProficiencias.map(skill => InscricaoController.normalizarProficiencia(skill))
        );

        // Verificação de Requisitos Faltantes
        const requisitosFaltando = [];
        
        for (const requisito of requisitosNormalizadosSet) {
            if (!usuarioSkillsNormalizadas.has(requisito)) {
                requisitosFaltando.push(requisito);
            }
        }
        
        if (requisitosFaltando.length > 0) {
            return {
                status: false,
                mensagem: `Faltam as proficiências: ${requisitosFaltando.join(', ')}`
            };
        }
        
        return { status: true, mensagem: "Pré-requisitos atendidos." };
    }

    // POST /api/inscricoes
    static async criarInscricao(req, res) {
        try {
            const { usuarioId, cursoId, usuarioProficiencias } = req.body;
            if (!cursoId || !mongoose.Types.ObjectId.isValid(cursoId)) {
                 return res.status(400).json({ message: 'ID do curso inválido.' });
            }

            const curso = await Curso.findById(cursoId);

            if (!curso) {
                return res.status(404).json({ message: 'Curso não encontrado.' });
            }

            const inscricaoExistente = await Inscricao.findByUserAndCourse(usuarioId, cursoId);
            if (inscricaoExistente) {
                return res.status(409).json({ 
                    message: `Você já está ${inscricaoExistente.status} neste curso.`,
                    status: inscricaoExistente.status 
                });
            }

            const checagem = await InscricaoController.checarPreRequisitos(curso.preRequisitos, usuarioProficiencias);

            if (!checagem.status) {
                return res.status(400).json({ 
                    message: `Falha nos pré-requisitos: ${checagem.mensagem}.`,
                    status: 'PreRequisitoFaltando' 
                });
            }

            const maxVagas = parseInt(curso.maximoVagas);
            const vagasOcupadas = await InscricaoModel.countDocuments({ cursoId: cursoId, status: 'Inscrito' });

            const vagasDisponiveis = maxVagas - vagasOcupadas;
            let novoStatus = vagasDisponiveis > 0 ? 'Inscrito' : 'Fila de Espera';

            // Criar a inscrição
            const novaInscricao = new Inscricao(usuarioId, cursoId, novoStatus);
            await novaInscricao.save();
            
            return res.status(201).json({ 
                message: `Sucesso! Status: ${novoStatus}.`, 
                status: novoStatus,
                vagasDisponiveis: vagasDisponiveis > 0 ? vagasDisponiveis - 1 : 0
            });

        } catch (error) {
            console.error('Erro ao criar inscrição:', error);
            if (error.code && error.code === 11000) {
                return res.status(409).json({ 
                    message: 'Você já está inscrito neste curso.',
                    status: 'Inscrito'
                });
            }
            res.status(500).json({ message: 'Erro interno ao processar a inscrição.' });
        }
    }

    static async getStatusInscricao(req, res) {
        try {
            const { cursoId, usuarioId } = req.params;
            
            // Buscar o curso
            const curso = await Curso.findById(cursoId);
            if (!curso) return res.status(404).json({ message: 'Curso não encontrado.' });

            const maxVagas = parseInt(curso.maximoVagas);

            // Contagem de vagas ocupadas
            const vagasOcupadas = await InscricaoModel.countDocuments({ cursoId: cursoId, status: 'Inscrito' });

            // Buscar o status da inscrição do usuário
            const statusUsuario = await Inscricao.findByUserAndCourse(usuarioId, cursoId);
            
            res.json({
                maxVagas: maxVagas,
                vagasOcupadas: vagasOcupadas,
                vagasDisponiveis: maxVagas - vagasOcupadas,
                statusUsuario: statusUsuario ? statusUsuario.status : 'NaoInscrito',
            });

        } catch (error) {
            console.error('Erro ao buscar status de inscrição:', error);
            res.status(500).json({ message: 'Erro interno ao buscar status.' });
        }
    }

    static async cancelarInscricao(req, res) {
        try {
            const { id } = req.params; 
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID da inscrição inválido." });
            }

            const inscricaoDeletada = await InscricaoModel.findByIdAndDelete(id);

            if (!inscricaoDeletada) {
                return res.status(404).json({ message: "Inscrição não encontrada." });
            }
            
            // (Opcional: Adicionar lógica para notificar o próximo da fila de espera, se houver)

            res.status(200).json({ message: "Inscrição cancelada com sucesso." });
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
            res.status(500).json({ message: 'Erro interno ao cancelar inscrição.' });
        }
    }
}

export default InscricaoController;

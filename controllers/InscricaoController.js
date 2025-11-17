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
        
        const requisitosNormalizadosSet = new Set(
            (cursoPreRequisitos || '') 
                .split(',')
                .map(req => InscricaoController.normalizarProficiencia(req)) 
                .filter(r => r.length > 0 && r !== 'nenhum') 
        );

        if (requisitosNormalizadosSet.size === 0) {
            return { status: true, mensagem: "Pré-requisitos atendidos." };
        }

        const usuarioSkillsNormalizadas = new Set(
            usuarioProficiencias.map(skill => InscricaoController.normalizarProficiencia(skill))
        );
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

            if (curso.concluido) {
                return res.status(400).json({ 
                    message: 'Este curso já foi concluído. Inscrições não são mais aceitas.',
                    status: 'CursoConcluido' 
                });
            }

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const dataInicio = new Date(curso.dataInicio);
            dataInicio.setHours(0, 0, 0, 0);
            
            if (hoje >= dataInicio) {
                return res.status(400).json({ 
                    message: 'As inscrições para este curso foram encerradas.',
                    status: 'InscricoesEncerradas' 
                });
            }

            const inscricaoExistente = await Inscricao.findByUserAndCourse(usuarioId, cursoId);
            if (inscricaoExistente) {
                return res.status(409).json({ 
                    message: `Você já está ${inscricaoExistente.status} neste curso.`,
                    status: inscricaoExistente.status 
                });
            }

            const maxVagas = parseInt(curso.maximoVagas);
            const vagasOcupadas = await InscricaoModel.countDocuments({ cursoId: cursoId, status: 'Inscrito' });

            const vagasDisponiveis = maxVagas - vagasOcupadas;
            let novoStatus = vagasDisponiveis > 0 ? 'Inscrito' : 'Fila de Espera';

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
            
            const curso = await Curso.findById(cursoId);
            if (!curso) return res.status(404).json({ message: 'Curso não encontrado.' });

            const maxVagas = parseInt(curso.maximoVagas);
            const vagasOcupadas = await InscricaoModel.countDocuments({ cursoId: cursoId, status: 'Inscrito' });

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
        

            res.status(200).json({ message: "Inscrição cancelada com sucesso." });
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
            res.status(500).json({ message: 'Erro interno ao cancelar inscrição.' });
        }
    }

    static async buscarInscricoesUsuario(req, res) {
        try {
            const { usuarioId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
                return res.status(400).json({ message: 'ID do usuário inválido.' });
            }

            const inscricoes = await InscricaoModel.find({ usuarioId: usuarioId })
                .populate('cursoId')
                .sort({ dataInscricao: -1 })
                .lean();

            const hoje = new Date();
            const inscricoesComStatus = inscricoes.map(inscricao => {
                if (!inscricao.cursoId) return inscricao;

                const dataInicio = new Date(inscricao.cursoId.dataInicio);
                const dataTermino = new Date(inscricao.cursoId.dataTermino);
                
                let statusCurso = 'desconhecido';
                
                if (inscricao.status === 'Concluido') {
                    statusCurso = 'concluido';
                } else if (dataTermino < hoje) {
                    statusCurso = 'concluido';
                } else if (dataInicio > hoje) {
                    statusCurso = 'vai_iniciar';
                } else {
                    statusCurso = 'em_andamento';
                }

                return {
                    ...inscricao,
                    statusCurso
                };
            });

            res.json(inscricoesComStatus);

        } catch (error) {
            console.error('Erro ao buscar inscrições do usuário:', error);
            res.status(500).json({ message: 'Erro interno ao buscar inscrições.' });
        }
    }

    static async concluirCurso(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'ID da inscrição inválido.' });
            }

            const inscricao = await Inscricao.updateStatus(id, 'Concluido');

            if (!inscricao) {
                return res.status(404).json({ message: 'Inscrição não encontrada.' });
            }

            res.json({
                message: 'Curso marcado como concluído com sucesso!',
                inscricao
            });

        } catch (error) {
            console.error('Erro ao concluir curso:', error);
            res.status(500).json({ message: 'Erro interno ao processar a solicitação.' });
        }
    }
}

export default InscricaoController;

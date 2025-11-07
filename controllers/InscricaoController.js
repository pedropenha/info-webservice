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
            // 🛑 CORREÇÃO NO FLUXO DE BUSCA E VALIDAÇÃO:
            // 1. Valida se o ID é válido *antes* de tentar buscar no banco.
            if (!cursoId || !mongoose.Types.ObjectId.isValid(cursoId)) {
                 return res.status(400).json({ message: 'ID do curso inválido.' });
            }

            // 2. Busca o curso usando o modelo personalizado (Curso.js)
            const curso = await Curso.findById(cursoId);

            // 3. Verifica se a busca retornou algo
            if (!curso) {
                // Se o curso não for encontrado (ID válido, mas não existe), retorna 404.
                return res.status(404).json({ message: 'Curso não encontrado.' });
            }

            // Verificar se o usuário já está inscrito ou na fila
            const inscricaoExistente = await Inscricao.findByUserAndCourse(usuarioId, cursoId);
            if (inscricaoExistente) {
                return res.status(409).json({ 
                    message: `Você já está ${inscricaoExistente.status} neste curso.`,
                    status: inscricaoExistente.status 
                });
            }

            // Checar os pré-requisitos do curso
            const checagem = await InscricaoController.checarPreRequisitos(curso.preRequisitos, usuarioProficiencias);

            if (!checagem.status) {
                return res.status(400).json({ 
                    message: `Falha nos pré-requisitos: ${checagem.mensagem}.`,
                    status: 'PreRequisitoFaltando' 
                });
            }

            // Determinar a quantidade de vagas disponíveis
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

    // GET /api/inscricoes/status/:cursoId/:usuarioId
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
}

export default InscricaoController;

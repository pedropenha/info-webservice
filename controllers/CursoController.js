// controllers/CursoController.js
import Curso from "../models/Curso.js";


class CursoController {

    static async getAllCursos(req, res) {
        try {
            const { busca, publico, local, faixaEtaria, horario, page, limit } = req.query; 
            const query = {};
            const pageInt = parseInt(page) || 1;
            const limitInt = parseInt(limit) || 10; 

            // --- LÓGICA DE BUSCA UNIFICADA (Segura com String) ---
            if (busca && busca.trim() !== '') {
                const regexBusca = new RegExp(busca, 'i');

                query.$or = [
                    { nome: regexBusca },
                    { descricao: regexBusca },
                    { instrutores: regexBusca },
                    { proeficiencias: regexBusca } 
                ];
            }
            
            // --- Lógica de Filtros COMBINÁVEIS ---
            if (publico && publico.trim() !== '') { query.publico = publico; }
            if (local && local.trim() !== '') { query.local = local; }
            if (faixaEtaria && faixaEtaria.trim() !== '') { query.faixaEtaria = faixaEtaria; }
            
            // Lógica de Filtro de Horário
            if (horario && horario.trim() !== '') {
                let regexHorario;
                switch (horario) {
                    case 'Noturno': regexHorario = /1[8-9]:|2[0-3]:/i; break;
                    case 'Diurno': regexHorario = /0[8-9]:|1[0-7]:/i; break;
                    case 'Fim de Semana': regexHorario = /S(á|a)bado|Domingo/i; break;
                    default: regexHorario = new RegExp(horario, 'i'); break;
                }
                query.horario = { $regex: regexHorario };
            }

            // paginação
            const resultadoPaginado = await Curso.findAll(query, pageInt, limitInt);
            
            res.json(resultadoPaginado);

        } catch (error) {
            console.error('Erro ao buscar catálogo de cursos:', error);
            res.status(500).json({ message: 'Erro interno ao buscar cursos' });
        }
    }
    
    static async getCursoById(req, res) {
        try {
            const { id } = req.params; 
            const cursoExistente = await Curso.findById(id);

            if (!cursoExistente) {
                return res.status(404).json({ message: 'Curso não encontrado' });
            }
            res.json(cursoExistente);
        } catch (error) {
            console.error('Erro ao buscar o curso:', error);
            res.status(500).json({ message: 'Erro interno ao buscar o curso' });
        }
    }

    static async createCurso(req, res) {
        try {
            const { nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias } = req.body;
            
            // 1. Instancia o novo curso
            const novoCurso = new Curso(nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias);
            
            // 2. VALIDAÇÃO DE REGRAS DE NEGÓCIO (Vagas)
            const minVagas = parseInt(minimoVagas);
            const maxVagas = parseInt(maximoVagas);
            
            if (isNaN(minVagas) || isNaN(maxVagas) || minVagas > maxVagas) {
                 return res.status(400).json({ message: "Erro de validação: O mínimo de vagas deve ser menor ou igual ao máximo de vagas." });
            }
            
            // 3. Simples verificação de formato (preRequisitos é String)
            novoCurso.preRequisitos = novoCurso.preRequisitos || '';

            // 4. Salva o curso
            await novoCurso.save();
            
            res.status(201).json(novoCurso);

        } catch (error) {
            console.error('Erro ao cadastrar curso', error);
            if (error.name === 'ValidationError') {
                 return res.status(400).json({ message: 'Dados inválidos no curso.', errors: error.errors });
            }
            res.status(500).send('Erro interno');
        }
    }
    
    static async updateCurso(req, res) {
        try {
            const { id } = req.params;
            const camposAtualizados = req.body; 
            
            const cursoExistente = await Curso.findById(id);

            if (!cursoExistente) {
                return res.status(404).json({ message: 'Curso não encontrado para atualização' });
            }
                        
            Object.keys(camposAtualizados).forEach(key => {
                if (cursoExistente.hasOwnProperty(key)) {
                    cursoExistente[key] = camposAtualizados[key];
                }
            });

            const cursoAtualizado = await cursoExistente.update();
            
            res.json(cursoAtualizado);

        } catch (error) {
            console.error('Erro ao atualizar curso', error);
            res.status(500).json({ message: 'Erro interno ao atualizar curso' });
        }
    }
    
    static async deleteCurso(req, res) {
        try {
            const { id } = req.params;
            const cursoDeletado = await Curso.delete(id);

            if (!cursoDeletado) {
                return res.status(404).json({ message: 'Curso não encontrado para deleção' });
            }
            
            res.status(204).send(); 

        } catch (error) {
            console.error('Erro ao deletar curso', error);
            res.status(500).json({ message: 'Erro interno ao deletar curso' });
        }
    }
    
}

export default CursoController;
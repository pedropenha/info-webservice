// controllers/CursoController.js
import Curso from "../models/Curso.js";
import CursoModel from "../Schemas/CursoSchema.js";  
import mongoose from 'mongoose';

class CursoController {


static async getDistinctTags(req, res) {
        const SAMPLE_SIZE = 15; // Define o número máximo de sugestões

        try {
            // Pipeline de Agregação:
            const tags = await CursoModel.aggregate([
                { $unwind: '$proficiencias' }, 
                { $group: { _id: '$proficiencias' } }, 
                { $sample: { size: SAMPLE_SIZE } },
                { $project: { _id: 0, tag: '$_id' } }
            ]);
            
            // Mapeia o resultado para um array simples de strings (Ex: ['Python', 'Figma'])
            const tagsLimpa = tags.map(item => item.tag)
                                  .filter(tag => tag && tag.trim().length > 0);
            
            res.json(tagsLimpa);
        } catch (error) {
            console.error('Erro ao buscar tags únicas e aleatórias:', error);
            res.status(500).json({ message: 'Erro ao buscar tags.' });
        }
    }

static async getAllCursos(req, res) {
    try {
        const { busca, proficiencias, local, faixaEtaria, horario, page, limit } = req.query;
        const query = {};

        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 9; 

        if (busca)
        {
            query.$or = 
            [
                { nome: { $regex: busca, $options: 'i' } },
                { instrutores: { $regex: busca, $options: 'i' } }
            ];
        }

        if (local) {
            query.local = local;
        }
        if (faixaEtaria) {
            query.faixaEtaria = faixaEtaria;
        }
        if (horario) {
            query.horario = horario;
        }

        // Filtrando pelos cursos com as proficiencias
        if (proficiencias) {
            // Tags que chegam do Front-end (ex: ['Lógica'])
            const tagsRecebidas = proficiencias.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            const regexArray = tagsRecebidas.map(tag => new RegExp(tag, 'i'));
            
            // O operador $all garante que o curso tenha todas as tags requeridas
            query.proficiencias = { $all: regexArray };
         }

        const cursos = await CursoModel.find(query)
            .skip((pageInt - 1) * limitInt) // Usa Ints corrigidos
            .limit(limitInt) // Usa Ints corrigidos
            .exec();

        const totalCursos = await CursoModel.countDocuments(query);
        const totalPaginas = Math.ceil(totalCursos / limitInt);

        res.json({
            cursos,
            total: totalCursos,
            totalPaginas,
            pagina: pageInt, // Retorna o valor inteiro
        });

    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).send('Erro ao buscar cursos');
    }
}


// Método para buscar um curso por ID (método mantido)
static async getCursoById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID do curso inválido." });
        }

        const curso = await Curso.findById(id);
        if (!curso) {
            return res.status(404).json({ message: "Curso não encontrado." });
        }
        res.status(200).json(curso);
    } catch (error) {
        console.error('Erro ao buscar curso:', error);
        res.status(500).json({ message: "Erro ao buscar o curso." });
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
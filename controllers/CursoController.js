// controllers/CursoController.js
import Curso from "../models/Curso.js";
import CursoModel from "../Schemas/CursoSchema.js";  
import InscricaoModel from "../Schemas/InscricaoSchema.js";
import UserController from "./UserController.js";
import mongoose from 'mongoose';class CursoController {


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
        // Verificar e atualizar cursos expirados automaticamente
        await CursoController.verificarCursosExpirados();
        
        const { busca, proficiencias, local, faixaEtaria, horario, status, page, limit } = req.query;
        const query = {};

        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 9; 

        if (busca)
        {
            query.$or = 
            [
                { nome: { $regex: busca, $options: 'i' } },
                { descricao: { $regex: busca, $options: 'i' } }
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

        // Filtro de status do curso
        if (status) {
            query.status = status;
        } else {
            // Por padrão, mostrar apenas cursos Ativos (não concluídos/cancelados)
            query.status = 'Ativo';
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
            .populate('instrutores', 'nome email foto')
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

        const cursoPopulado = await CursoModel.findById(id)
            .populate('instrutores', 'nome email foto nivel')
            .lean();
        
        console.log('Curso populado:', JSON.stringify(cursoPopulado, null, 2));
        
        if (!cursoPopulado) {
            return res.status(404).json({ message: "Curso não encontrado." });
        }
        res.status(200).json(cursoPopulado);
    } catch (error) {
        console.error('Erro ao buscar curso:', error);
        res.status(500).json({ message: "Erro ao buscar o curso." });
    }
}

static async createCurso(req, res) {
    try {
        const { nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias, dataInicio, dataTermino } = req.body;
        
        // Validar instrutores
        if (!instrutores || !Array.isArray(instrutores) || instrutores.length === 0) {
            return res.status(400).json({ message: "Pelo menos um instrutor é obrigatório." });
        }
        
        // Verificar se todos os instrutores existem e são admin ou professor
        const instrutoresValidos = await mongoose.model('User').find({
            _id: { $in: instrutores },
            nivel: { $in: ['admin', 'professor'] }
        });
        
        if (instrutoresValidos.length !== instrutores.length) {
            return res.status(400).json({ message: "Um ou mais instrutores são inválidos ou não possuem permissão." });
        }
        
        // 1. Instancia o novo curso
        const novoCurso = new Curso(nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias, dataInicio, dataTermino);
        
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
        
        // Validar instrutores se estiverem sendo atualizados
        if (camposAtualizados.instrutores) {
            if (!Array.isArray(camposAtualizados.instrutores) || camposAtualizados.instrutores.length === 0) {
                return res.status(400).json({ message: "Pelo menos um instrutor é obrigatório." });
            }
            
            // Verificar se todos os instrutores existem e são admin ou professor
            const instrutoresValidos = await mongoose.model('User').find({
                _id: { $in: camposAtualizados.instrutores },
                nivel: { $in: ['admin', 'professor'] }
            });
            
            if (instrutoresValidos.length !== camposAtualizados.instrutores.length) {
                return res.status(400).json({ message: "Um ou mais instrutores são inválidos ou não possuem permissão." });
            }
        }
        
        // Converter proficiências se vier como string
        if (camposAtualizados.proeficiencias && typeof camposAtualizados.proeficiencias === 'string') {
            camposAtualizados.proficiencias = camposAtualizados.proeficiencias
                .split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            delete camposAtualizados.proeficiencias;
        }
        
        // Atualizar diretamente no modelo
        const cursoAtualizado = await CursoModel.findByIdAndUpdate(
            id,
            camposAtualizados,
            { new: true, runValidators: true }
        );

        if (!cursoAtualizado) {
            return res.status(404).json({ message: 'Curso não encontrado para atualização' });
        }
        
        res.json(cursoAtualizado);

    } catch (error) {
        console.error('Erro ao atualizar curso', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Dados inválidos no curso.', errors: error.errors });
        }
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

// Marcar curso como concluído manualmente (Admin/Professor)
static async marcarComoConcluido(req, res) {
    try {
        const { id } = req.params;
        
        const curso = await CursoModel.findByIdAndUpdate(
            id,
            { 
                concluido: true, 
                dataConclusao: new Date(),
                status: 'Concluído'
            },
            { new: true }
        );
        
        if (!curso) {
            return res.status(404).json({ message: 'Curso não encontrado' });
        }
        
        // Adicionar proficiências do curso aos alunos inscritos
        await CursoController.adicionarProficienciasAosAlunos(id, curso.proficiencias);
        
        res.json(curso);
    } catch (error) {
        console.error('Erro ao marcar curso como concluído', error);
        res.status(500).json({ message: 'Erro ao marcar curso como concluído' });
    }
}

// Verificar e atualizar cursos expirados automaticamente
static async verificarCursosExpirados() {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Começo do dia
        
        // Buscar cursos que expiraram
        const cursosExpirados = await CursoModel.find({
            dataTermino: { $lt: hoje },
            concluido: false 
        });
        
        // Atualizar cada curso e adicionar proficiências aos alunos
        for (const curso of cursosExpirados) {
            await CursoModel.findByIdAndUpdate(
                curso._id,
                { 
                    concluido: true,
                    dataConclusao: new Date(),
                    status: 'Concluído'
                }
            );
            
            // Adicionar proficiências aos alunos inscritos
            await CursoController.adicionarProficienciasAosAlunos(curso._id, curso.proficiencias);
        }
        
        if (cursosExpirados.length > 0) {
            console.log(`${cursosExpirados.length} curso(s) marcado(s) como concluído(s) automaticamente`);
        }
    } catch (error) {
        console.error('Erro ao verificar cursos expirados:', error);
    }
}

// Método auxiliar para adicionar proficiências aos alunos inscritos em um curso
static async adicionarProficienciasAosAlunos(cursoId, proficiencias) {
    try {
        if (!proficiencias || proficiencias.length === 0) {
            return;
        }

        // Buscar todos os alunos inscritos no curso com status 'Inscrito'
        const inscricoes = await InscricaoModel.find({ 
            cursoId: cursoId,
            status: 'Inscrito' 
        });

        console.log(`Adicionando proficiências [${proficiencias.join(', ')}] a ${inscricoes.length} aluno(s)`);

        // Adicionar proficiências a cada aluno e atualizar status da inscrição para 'Concluido'
        for (const inscricao of inscricoes) {
            await UserController.adicionarProficiencias(inscricao.usuarioId, proficiencias);
            
            // Atualizar status da inscrição para 'Concluido'
            await InscricaoModel.findByIdAndUpdate(
                inscricao._id,
                { status: 'Concluido' }
            );
        }
        
        console.log(`${inscricoes.length} inscrição(ões) marcada(s) como 'Concluido'`);
    } catch (error) {
        console.error('Erro ao adicionar proficiências aos alunos:', error);
    }
}

    
}
export default CursoController;
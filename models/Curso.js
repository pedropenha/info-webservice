// /models/Curso.js
import CursoModel from "../Schemas/CursoSchema.js";

class Curso {
    constructor(nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias, id = null) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.conteudo = conteudo;
        this.instrutores = instrutores;
        this.preRequisitos = preRequisitos;
        this.local = local;
        this.publico = publico;
        this.minimoVagas = minimoVagas;
        this.maximoVagas = maximoVagas;
        this.horario = horario;
        this.faixaEtaria = faixaEtaria;
        this.proeficiencias = proeficiencias;
    }
    
    toMongooseObject() {
        return {
            nome: this.nome,
            descricao: this.descricao,
            conteudo: this.conteudo,
            instrutores: this.instrutores,
            preRequisitos: this.preRequisitos,
            local: this.local,
            publico: this.publico,
            minimoVagas: this.minimoVagas,
            maximoVagas: this.maximoVagas,
            horario: this.horario,
            faixaEtaria: this.faixaEtaria,
            proeficiencias: this.proeficiencias,
        };
    }

    // CREATE (Método de instância)
    async save() {
        const novoCurso = new CursoModel(this.toMongooseObject());
        const cursoSalvo = await novoCurso.save();
        this.id = cursoSalvo._id;
        return cursoSalvo;
    }

    // READ/LIST (Método estático para Listagem, Busca e Filtro)
    static async findAll(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit; 
            const totalDocumentos = await CursoModel.countDocuments(query);
            const cursosData = await CursoModel.find(query)
                .skip(skip)
                .limit(limit)
                .lean(); 
            
            const cursos = cursosData.map(data => new Curso(
                data.nome, data.descricao, data.conteudo, data.instrutores, data.preRequisitos, 
                data.local, data.publico, data.minimoVagas, data.maximoVagas, data.horario, 
                data.faixaEtaria, data.proeficiencias, data._id 
            ));

            return {
                cursos,
                total: totalDocumentos,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(totalDocumentos / limit)
            };
            
        } catch (error) {
            console.error("Erro na Classe Model Curso (findAll):", error);
            throw new Error("Falha ao buscar cursos.");
        }
    }
    
    // READ (Método estático para buscar por ID)
    static async findById(id) {
        const data = await CursoModel.findById(id).lean();
        if (!data) return null;

        return new Curso(
            data.nome, data.descricao, data.conteudo, data.instrutores, data.preRequisitos, 
            data.local, data.publico, data.minimoVagas, data.maximoVagas, data.horario, 
            data.faixaEtaria, data.proeficiencias, data._id
        );
    }

    // UPDATE (Método de instância)
    async update() {
        if (!this.id) {
            throw new Error("ID do curso é necessário para a atualização.");
        }
        
        const cursoAtualizado = await CursoModel.findByIdAndUpdate(
            this.id, 
            this.toMongooseObject(), // Usa o objeto atual da instância
            { new: true } // Retorna o documento atualizado
        );

        return cursoAtualizado;
    }
    
    // DELETE (Método estático)
    static async delete(id) {
        return await CursoModel.findByIdAndDelete(id);
    }
}

export default Curso;
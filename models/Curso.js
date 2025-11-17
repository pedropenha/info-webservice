import mongoose from 'mongoose';
import CursoModel from "../Schemas/CursoSchema.js";

class Curso {
    constructor(nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias, dataInicio, dataTermino, id = null) {
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
        this.dataInicio = dataInicio;
        this.dataTermino = dataTermino;
    }

    async save() {
        const novoCurso = new CursoModel(this);
        await novoCurso.save();
        return novoCurso;
    }

    
    static async findAll(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            return await CursoModel.find(query).skip(skip).limit(limit).lean();
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
            throw new Error("Erro ao buscar cursos.");
        }
    }

    
    static async findById(id) {
        return await CursoModel.findById(id).lean();
    }

    
    async update() {
        if (!this.id) throw new Error("ID do curso é necessário para atualização.");
        return await CursoModel.findByIdAndUpdate(this.id, this, { new: true });
    }

    
    static async delete(id) {
        return await CursoModel.findByIdAndDelete(id);
    }
}

export default Curso;

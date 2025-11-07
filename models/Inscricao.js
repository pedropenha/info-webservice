// src/models/Inscricao.js
import InscricaoModel from "../Schemas/InscricaoSchema.js";
import mongoose from 'mongoose'; // Necessário para ObjectId

class Inscricao {
    
    constructor(usuarioId, cursoId, status = 'Inscrito', id = null, dataInscricao = Date.now()) {
        this.id = id;
        // Assegura que os IDs são ObjectId para a busca (mesmo que sejam Strings no construtor)
        this.usuarioId = new mongoose.Types.ObjectId(usuarioId);
        this.cursoId = new mongoose.Types.ObjectId(cursoId);
        this.status = status;
        this.dataInscricao = dataInscricao;
    }

    toMongooseObject() {
        return {
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            status: this.status,
            dataInscricao: this.dataInscricao,
        };
    }

    // CREATE
    async save() {
        const novaInscricao = new InscricaoModel({
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            status: this.status
        });

        return await novaInscricao.save();
    }

    // READ: Busca se o usuário já está inscrito ou na fila
    static async findByUserAndCourse(usuarioId, cursoId) {
        return await InscricaoModel.findOne({ usuarioId: usuarioId, cursoId: cursoId });
    }
    
    // READ: Busca por ID da inscrição (se necessário)
    static async findById(id) {
        try {
            const curso = await CursoModel.findById(id).lean(); // .lean() retorna o objeto "simples", sem métodos do mongoose
            return curso;
        } catch (error) {
            console.error('Erro ao buscar curso:', error);
            throw new Error("Erro ao buscar o curso.");
        }
    }

    // UPDATE: Atualiza status (ex: para Concluido ou Cancelado)
    static async updateStatus(id, newStatus) {
        return await InscricaoModel.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );
    }
}

export default Inscricao;
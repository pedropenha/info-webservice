
import InscricaoModel from "../Schemas/InscricaoSchema.js";
import mongoose from 'mongoose';

class Inscricao {
    
    constructor(usuarioId, cursoId, status = 'Inscrito', id = null, dataInscricao = Date.now()) {
        this.id = id;
        
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

   
    async save() {
        const novaInscricao = new InscricaoModel({
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            status: this.status
        });

        return await novaInscricao.save();
    }

    
    static async findByUserAndCourse(usuarioId, cursoId) {
        return await InscricaoModel.findOne({ usuarioId: usuarioId, cursoId: cursoId });
    }
    
    static async findById(id) {
        try {
            const curso = await CursoModel.findById(id).lean();
            return curso;
        } catch (error) {
            console.error('Erro ao buscar curso:', error);
            throw new Error("Erro ao buscar o curso.");
        }
    }

    static async updateStatus(id, newStatus) {
        return await InscricaoModel.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );
    }
}

export default Inscricao;
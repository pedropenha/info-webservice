import AvaliacaoModel from "../Schemas/AvaliacaoSchema.js";
import mongoose from 'mongoose';

class Avaliacao {
    constructor(usuarioId, cursoId, nota, mensagem, oculta = false, id = null) {
        this.id = id;
        this.usuarioId = new mongoose.Types.ObjectId(usuarioId);
        this.cursoId = new mongoose.Types.ObjectId(cursoId);
        this.nota = nota;
        this.mensagem = mensagem;
        this.oculta = oculta;
    }

    // CREATE
    async save() {
        const novaAvaliacao = new AvaliacaoModel({
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            nota: this.nota,
            mensagem: this.mensagem,
            oculta: this.oculta
        });

        return await novaAvaliacao.save();
    }

    // READ: Buscar avaliação por usuário e curso
    static async findByUserAndCourse(usuarioId, cursoId) {
        return await AvaliacaoModel.findOne({ 
            usuarioId: usuarioId, 
            cursoId: cursoId 
        });
    }

    // READ: Buscar todas as avaliações de um curso
    static async findByCourse(cursoId) {
        return await AvaliacaoModel.find({ cursoId: cursoId })
            .populate('usuarioId', 'nome foto')
            .sort({ createdAt: -1 })
            .lean();
    }

    // READ: Buscar média de avaliações de um curso
    static async getMediaByCourse(cursoId) {
        const result = await AvaliacaoModel.aggregate([
            { $match: { cursoId: new mongoose.Types.ObjectId(cursoId), oculta: false } },
            { $group: {
                _id: null,
                media: { $avg: '$nota' },
                total: { $sum: 1 }
            }}
        ]);

        if (result.length === 0) {
            return { media: 0, total: 0 };
        }

        return {
            media: Math.round(result[0].media * 10) / 10,
            total: result[0].total
        };
    }

    // UPDATE: Ocultar/mostrar avaliação
    static async toggleVisibility(id, oculta) {
        return await AvaliacaoModel.findByIdAndUpdate(
            id,
            { oculta: oculta },
            { new: true }
        );
    }

    // DELETE: Remover avaliação (se necessário)
    static async delete(id) {
        return await AvaliacaoModel.findByIdAndDelete(id);
    }
}

export default Avaliacao;
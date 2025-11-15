import mongoose from 'mongoose';

const AvaliacaoSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
        },
        cursoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curso',
            required: true,
        },
        nota: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        mensagem: {
            type: String,
            required: true,
        },
        oculta: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// Garante que um usuário só pode avaliar uma vez por curso
AvaliacaoSchema.index({ usuarioId: 1, cursoId: 1 }, { unique: true });

const AvaliacaoModel = mongoose.model('Avaliacao', AvaliacaoSchema);

export default AvaliacaoModel;
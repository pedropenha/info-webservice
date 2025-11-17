import mongoose from 'mongoose';

const ResumoAvaliacaoSchema = new mongoose.Schema(
    {
        cursoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curso',
            required: true,
            unique: true // Um resumo por curso
        },
        resumoIA: {
            type: String,
            required: true,
        },
        totalAvaliacoes: {
            type: Number,
            required: true,
            default: 0
        },
        mediaNotas: {
            type: Number,
            required: true,
            default: 0
        },
        distribuicaoNotas: {
            nota1: { type: Number, default: 0 },
            nota2: { type: Number, default: 0 },
            nota3: { type: Number, default: 0 },
            nota4: { type: Number, default: 0 },
            nota5: { type: Number, default: 0 }
        },
        ultimaAtualizacao: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

const ResumoAvaliacaoModel = mongoose.model('ResumoAvaliacao', ResumoAvaliacaoSchema);

export default ResumoAvaliacaoModel;

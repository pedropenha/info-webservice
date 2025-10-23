import mongoose from 'mongoose';

const AvaliacaoSchema = new mongoose.Schema(
    {
        usuario:{
            type: String,
            required: true,
        },
        curso: {
            type: String,
            required: true,
        },
        nota: {
            type: int,
            required: true,
        },
        mensagem: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const AvaliacaoModel = mongoose.model('Avaliacao', AvaliacaoSchema);

export default AvaliacaoModel;
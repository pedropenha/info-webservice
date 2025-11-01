import mongoose from 'mongoose';

const InscricaoSchema = mongoose.Schema({
    curso: {
        type: Curso,
        required: true,
    },
    usuario: {
        type: User,
        required: true,
    }
});

const InscricaoModel = mongoose.model("inscricao", InscricaoSchema);

export default InscricaoModel;
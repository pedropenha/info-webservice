import mongoose from 'mongoose';

const InscricaoSchema = mongoose.Schema({
    cursoId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso', 
        required: true,
    },
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: true,
    },
    dataInscricao: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Inscrito', 'Fila de Espera', 'Concluido', 'Cancelado'],
        default: 'Inscrito',
    }
},
{ 
    // Garante que um usuário só pode se inscrever uma vez por curso
    uniqueKeys: [['usuarioId', 'cursoId']] 
});

const InscricaoModel = mongoose.model("Inscricao", InscricaoSchema); 

export default InscricaoModel;
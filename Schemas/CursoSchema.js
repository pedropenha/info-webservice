// Schemas/CursoSchema.js
import mongoose from 'mongoose';

const CursoSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
        },
        descricao: {
            type: String,
            required: true,
        },
        conteudo: {
            type: String,
            required: true
        },
        instrutores: { 
            type: String,
            required: true,
        },
        
        preRequisitos: {
            type: String, 
            required: true,
        },
        
        local: {
            type: String,
            required: true,
        },
        publico: {
            type: String,
            required: true,
        },
        minimoVagas: {
            type: String,
            required: true,
        },
        maximoVagas: {
            type: String,
            required: true,
        },
        horario: {
            type: String,
            required: true,
        },
        faixaEtaria: {
            type: String,
            required: true
        },
        proficiencias: {
            type: [String],
            default: []
        }
    }
);

const CursoModel = mongoose.model('Curso', CursoSchema);
export default CursoModel;
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
        instrutores: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        
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
        },
        dataInicio: {
            type: Date,
            required: true
        },
        dataTermino: {
            type: Date,
            required: true
        },
        concluido: {
            type: Boolean,
            default: false
        },
        dataConclusao: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['Ativo', 'Concluído', 'Cancelado'],
            default: 'Ativo'
        }
    },
    {
        timestamps: true
    }
);

// Validação: pelo menos 1 instrutor
CursoSchema.path('instrutores').validate(function(value) {
    return value && value.length > 0;
}, 'Pelo menos um instrutor é obrigatório.');

const CursoModel = mongoose.model('Curso', CursoSchema);
export default CursoModel;
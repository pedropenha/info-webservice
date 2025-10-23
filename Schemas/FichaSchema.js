import mongoose from 'mongoose';

const FichaSchema = new mongoose.Schema(
    {
        usuario: {
            type: String,
            required: true,
        },
        proeficiencias: {
            type: Array,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const FichaModel = mongoose.model('Ficha', FichaSchema);

export default FichaModel;
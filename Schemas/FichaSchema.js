import mongoose from 'mongoose';

const FichaSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        proficiencias: {
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
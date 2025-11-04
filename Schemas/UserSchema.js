import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        cpf: {
            type: String,
            required: true
        },
        nome: {
            type: String,
            required: true,
        },
        senha: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        nivel: {
            type: String,
            required: true,
        },
        foto: {
            type: String,
            default: null
        },
        proficiencias: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
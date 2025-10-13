import mongoose from 'mongoose';

//Schema do carro no MongoDB
const CarroSchema = new mongoose.Schema(
    {
        placa : {type: String, required: true, unique: true},
        modelo : {type: String, required: true},
        ano : {type: String, required: true},
        preco : {type: String, required: true},
    },
    {
        timestamps: true, // Cria campos de createdAt e updatedAt automaticamente
    }
);

const CarroModel = mongoose.model('Carro', CarroSchema);

export default CarroModel;

import CarroModel from './CarroSchema.js';

class Carro{

    constructor(placa, modelo, ano, preco){
        this.placa = placa;
        this.modelo = modelo;
        this.ano = ano;
        this.preco = preco;
    }

    async save(){
        const novoCarro = new CarroModel({
            placa: this.placa,
            modelo: this.modelo,
            ano: this.ano,
            preco: this.preco
        });

        return await novoCarro.save();
    }

    static async findAll(){
        return await CarroModel.find();
    }

    static async findById(id){
        return await CarroModel.findById(id);
    }

    static async findByPlaca(placa){
        return await CarroModel.findOne({placa : placa});
    }

    static async delete(id){
        return await CarroModel.findByIdAndDelete(id);
    }
    
    //Implemente outros métodos necessários
}

export default Carro;

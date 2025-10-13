import path from 'path';
import __dirname from '../utils/pathUtils.js';
import Carro from '../models/Carro.js';

class CarroController{

    static async getAllCarros(req, res){
        try {
            const carros = await Carro.findAll();
            res.json(carros); //Retorna os carros como JSON
        } catch (error) {
            console.error('Erro ao carregar os carros:', error);
            res.status(500).json({message: 'Erro interno ao buscar carros'})
        }
    }

    static async getCarroById(req, res){
        try {
            const { id } = req.params; //Parâmetros URL
            const carroExistente = await Carro.findById(id);

            if(!carroExistente){
                return res.status(404).json({ message: 'Carro não encontrado'});
            }
            res.json(carroExistente); //Retorna o carro como JSON            
        } catch (error) {
            console.error('Erro ao carregar o carro:', error);
            res.status(500).json({message: 'Erro interno ao buscar o carro'})
        }
    }

    static async createCarro(req, res){
        try {
            const { placa, modelo, ano, preco } = req.body;
            const carroExistente = await Carro.findByPlaca(placa);

            if(carroExistente){
                return res.status(400).json({ message: 'Já existe um carro com essa placa'});
            }
            else{
                const novoCarro = new Carro(placa, modelo, ano, preco);
                await novoCarro.save();
                res.status(201).json(novoCarro);
            }
        } catch (error) {
            console.error('Erro ao cadastrar carro', error);
            res.status(500).send('Erro interno');
        }
    }
    
    //Implemente os outros métodos da API RESTful
    static async updateCarro(req, res){}
    static async deleteCarro(req, res){}

    //Implementação dos Renders das Páginas WEB
    static async renderCreateCarro(req, res){
        try {
            res.sendFile(path.join(__dirname, 'views', 'cadastrar-carro.html'));
        } catch (error) {
            console.error('Erro ao carregar a página:', error);
            res.status(500).send('Erro interno');
        }
    }

    static async renderAllCarros(req, res){
        try {
            const carros = await Carro.findAll();
            //res.sendFile(path.join(__dirname, 'views', 'visualizar-carros.html'));
            res.render('visualizar-carros', {carros: carros});
        } catch (error) {
            console.error('Erro ao carregar a página:', error);
            res.status(500).send('Erro interno');
        }
    }
    
}

export default CarroController;
import User from "../models/User.js";

class UserController{
    static async createUser(req, res){
        try{
            const { cpf, nome, email, senha, nivel } = req.body;
            const UserExits = await User.findByCpf(cpf);

            if(UserExits){
                return res.status(422).json({ message: "Usuário já cadastrado"});
            }

            const newUser = new User(nome, senha, email, cpf, nivel);
            await newUser.save();
            res.status(201).json(newUser);
        }catch(error){
            console.error('Erro ao cadastrar usuário', error);
            res.status(500).send('Erro interno');
        }
    }

    static async getAllUsers(req, res){
        try{
            const users = await User.findAll();
            res.status(200).json({ data: users });
        }catch (error){
            console.error('Erro ao buscar usuários', error);
            res.status(500).send('Erro interno');
        }
    }
}
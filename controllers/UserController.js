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

    static async getUserById(req, res){
        try{
            const { id } = req.params;
            const user = await User.findById(id);

            if(!user){
                return res.status(404).json({ message: "Usuário não encontrado"});
            }

            // Não retornar a senha
            const { senha, ...userData } = user._doc;
            res.status(200).json(userData);
        }catch(error){
            console.error('Erro ao buscar usuário', error);
            res.status(500).json({ message: 'Erro interno ao buscar usuário' });
        }
    }

    static async updateUser(req, res){
        try{
            const { id } = req.params;
            const { nome, email, foto, proficiencias } = req.body;

            // Verificar se o usuário existe
            const user = await User.findById(id);
            if(!user){
                return res.status(404).json({ message: "Usuário não encontrado"});
            }

            // Atualizar apenas os campos permitidos
            const updateData = {};
            if(nome) updateData.nome = nome;
            if(email) updateData.email = email;
            if(foto !== undefined) updateData.foto = foto;
            if(proficiencias !== undefined) updateData.proficiencias = proficiencias;

            const updatedUser = await User.update(id, updateData);
            
            // Não retornar a senha
            const { senha, ...userData } = updatedUser._doc;
            res.status(200).json({ 
                message: "Usuário atualizado com sucesso",
                user: userData 
            });
        }catch(error){
            console.error('Erro ao atualizar usuário', error);
            res.status(500).json({ message: 'Erro interno ao atualizar usuário' });
        }
    }

    static async deleteUser(req, res){
        try{
            const { id } = req.params;

            // Verificar se o usuário existe
            const user = await User.findById(id);
            if(!user){
                return res.status(404).json({ message: "Usuário não encontrado"});
            }

            await User.delete(id);
            res.status(204).send();
        }catch(error){
            console.error('Erro ao deletar usuário', error);
            res.status(500).json({ message: 'Erro interno ao deletar usuário' });
        }
    }
}

export default UserController;
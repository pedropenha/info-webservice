import User from "../models/User.js";
import InscricaoModel from "../Schemas/InscricaoSchema.js";
import AvaliacaoModel from "../Schemas/AvaliacaoSchema.js";
import mongoose from 'mongoose'; 

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

            const user = await User.findById(id);
            if(!user){
                return res.status(404).json({ message: "Usuário não encontrado"});
            }
            const updateData = {};
            if(nome) updateData.nome = nome;
            if(email) updateData.email = email;
            if(foto !== undefined) updateData.foto = foto;
            if(proficiencias !== undefined) updateData.proficiencias = proficiencias;

            const updatedUser = await User.update(id, updateData);
            
            
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
    static async getUserInscricoes(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID de usuário inválido." });
            }

            
            const inscricoes = await InscricaoModel.find({ usuarioId: id })
                .populate({
                    path: 'cursoId',
                    populate: {
                        path: 'instrutores',
                        select: 'nome email foto nivel'
                    }
                });
            
            if (!inscricoes) {
                return res.status(200).json([]);
            }

            const inscricoesValidas = inscricoes.filter(insc => insc.cursoId);

            const inscricoesComAvaliacao = await Promise.all(
                inscricoesValidas.map(async (inscricao) => {
                    const avaliacao = await AvaliacaoModel.findOne({
                        usuarioId: id,
                        cursoId: inscricao.cursoId._id
                    });

                    return {
                        ...inscricao.toObject(),
                        avaliacao: avaliacao ? {
                            nota: avaliacao.nota,
                            comentario: avaliacao.mensagem,
                            dataAvaliacao: avaliacao.createdAt
                        } : null
                    };
                })
            );

            res.status(200).json(inscricoesComAvaliacao);

        } catch (error) {
            console.error('Erro ao buscar inscrições do usuário:', error);
            res.status(500).json({ message: 'Erro interno ao buscar inscrições.' });
        }
    }

    static async listarProfessores(req, res) {
        try {
            const professores = await mongoose.model('User').find({
                nivel: { $in: ['admin', 'professor'] }
            })
            .select('nome email foto nivel')
            .sort({ nome: 1 });

            res.status(200).json(professores);
        } catch (error) {
            console.error('Erro ao listar professores:', error);
            res.status(500).json({ message: 'Erro ao listar professores.' });
        }
    }

    
    static async adicionarProficiencias(userId, novasProficiencias) {
        try {
            if (!novasProficiencias || novasProficiencias.length === 0) {
                return { success: true, message: 'Nenhuma proficiência para adicionar' };
            }

            const UserModel = mongoose.model('User');
            
            await UserModel.findByIdAndUpdate(
                userId,
                { $addToSet: { proficiencias: { $each: novasProficiencias } } },
                { new: true }
            );

            return { success: true, message: 'Proficiências adicionadas com sucesso' };
        } catch (error) {
            console.error('Erro ao adicionar proficiências:', error);
            return { success: false, message: 'Erro ao adicionar proficiências', error };
        }
    }
}

export default UserController;
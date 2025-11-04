import User from "../models/User.js";

class AuthController {
    // Cadastro de novo usuário (sempre com nível 'user')
    static async cadastro(req, res) {
        try {
            const { cpf, nome, email, senha } = req.body;

            // Validações
            if (!cpf || !nome || !email || !senha) {
                return res.status(400).json({ 
                    message: "Todos os campos são obrigatórios" 
                });
            }

            // Verificar se o usuário já existe
            const userExists = await User.findByCpf(cpf);

            if (userExists) {
                return res.status(422).json({ 
                    message: "Usuário já cadastrado com este CPF" 
                });
            }

            // Criar novo usuário com nível 'user' por padrão
            const newUser = new User(nome, senha, email, cpf, 'user');
            await newUser.save();

            res.status(201).json({ 
                message: "Usuário cadastrado com sucesso",
                user: {
                    nome: newUser.nome,
                    email: newUser.email,
                    cpf: newUser.cpf,
                    nivel: newUser.nivel
                }
            });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            res.status(500).json({ 
                message: 'Erro interno ao cadastrar usuário' 
            });
        }
    }

    // Login de usuário
    static async login(req, res) {
        try {
            const { cpf, senha } = req.body;

            // Validações
            if (!cpf || !senha) {
                return res.status(400).json({ 
                    message: "CPF e senha são obrigatórios" 
                });
            }

            // Buscar usuário pelo CPF
            const user = await User.findByCpf(cpf);

            if (!user) {
                return res.status(401).json({ 
                    message: "CPF ou senha incorretos" 
                });
            }

            // Verificar senha (comparação direta - em produção use bcrypt)
            if (user.senha !== senha) {
                return res.status(401).json({ 
                    message: "CPF ou senha incorretos" 
                });
            }

            // Login bem-sucedido
            res.status(200).json({ 
                message: "Login realizado com sucesso",
                user: {
                    _id: user._id,
                    id: user._id,
                    nome: user.nome,
                    email: user.email,
                    cpf: user.cpf,
                    nivel: user.nivel,
                    foto: user.foto || null,
                    proficiencias: user.proficiencias || [],
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ 
                message: 'Erro interno ao fazer login' 
            });
        }
    }
}

export default AuthController;

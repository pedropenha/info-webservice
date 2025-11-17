import express from "express";
import UserController from '../controllers/UserController.js';

const router = express.Router();

// Rota para listar professores e admins
router.get('/professores', UserController.listarProfessores);

// Rota para buscar todos os usuários
router.get('/', UserController.getAllUsers);

// Rota para buscar usuário por ID
router.get('/:id', UserController.getUserById);

// Rota para criar novo usuário
router.post('/', UserController.createUser);

// Rota para atualizar usuário
router.put('/:id', UserController.updateUser);

// Rota para deletar usuário
router.delete('/:id', UserController.deleteUser);

router.get('/:id/inscricoes', UserController.getUserInscricoes);
export default router;

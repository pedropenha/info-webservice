import express from "express";
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

// Rota para cadastro de usuário
router.post('/cadastro', AuthController.cadastro);

// Rota para login de usuário
router.post('/login', AuthController.login);

export default router;

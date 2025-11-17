import express from "express";
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/cadastro', AuthController.cadastro);

router.post('/login', AuthController.login);

export default router;

import express from "express";
import CarroController from '../controllers/CarroController.js';
import cursoRoutes from './cursoRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import inscricaoRoutes from './InscricaoRoutes.js';
import GeminiRoutes from './GeminiRoutes.js';
import recomendacaoRoutes from './RecomendacaoRoutes.js';

const router = express.Router();

//router.get('/', User.find);
router.use('/api/cursos', cursoRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/inscricoes', inscricaoRoutes); 
router.use('/api/gemini', GeminiRoutes)
//router.post('/', User.save);
router.use('/api/recomendacoes', recomendacaoRoutes);
export default router;

import express from "express";
import CarroController from '../controllers/CarroController.js';
import cursoRoutes from './cursoRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';


const router = express.Router();

//router.get('/', User.find);
router.use('/api/cursos', cursoRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
//router.post('/', User.save);

export default router;

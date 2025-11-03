import express from "express";
import CarroController from '../controllers/CarroController.js';
import cursoRoutes from './cursoRoutes.js';


const router = express.Router();

//router.get('/', User.find);
router.use('/api/cursos', cursoRoutes);
//router.post('/', User.save);

export default router;

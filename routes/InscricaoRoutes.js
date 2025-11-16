// src/routes/inscricaoRoutes.js
import express from 'express';
import InscricaoController from '../controllers/InscricaoController.js';

const router = express.Router();

router.post('/', InscricaoController.criarInscricao); 
router.get('/status/:cursoId/:usuarioId', InscricaoController.getStatusInscricao);
router.delete('/:id', InscricaoController.cancelarInscricao);

export default router;
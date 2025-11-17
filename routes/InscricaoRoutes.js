
import express from 'express';
import InscricaoController from '../controllers/InscricaoController.js';

const router = express.Router();

router.post('/', InscricaoController.criarInscricao); 
router.get('/status/:cursoId/:usuarioId', InscricaoController.getStatusInscricao);
router.delete('/:id', InscricaoController.cancelarInscricao);
router.get('/usuario/:usuarioId', InscricaoController.buscarInscricoesUsuario);
router.patch('/:id/concluir', InscricaoController.concluirCurso);

export default router;
import express from 'express';
import AvaliacaoController from '../controllers/AvaliacaoController.js';

const router = express.Router();
router.post('/', AvaliacaoController.criarAvaliacao);
router.get('/curso/:cursoId', AvaliacaoController.buscarAvaliacoesCurso);
router.get('/verificar/:cursoId/:usuarioId', AvaliacaoController.verificarAvaliacao);
router.patch('/:id/ocultar', AvaliacaoController.toggleOcultarAvaliacao);

export default router;

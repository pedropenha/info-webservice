import express from 'express';
import AvaliacaoController from '../controllers/AvaliacaoController.js';

const router = express.Router();

// POST /api/avaliacoes - Criar avaliação
router.post('/', AvaliacaoController.criarAvaliacao);

// GET /api/avaliacoes/curso/:cursoId - Buscar avaliações de um curso
router.get('/curso/:cursoId', AvaliacaoController.buscarAvaliacoesCurso);

// GET /api/avaliacoes/verificar/:cursoId/:usuarioId - Verificar se usuário já avaliou
router.get('/verificar/:cursoId/:usuarioId', AvaliacaoController.verificarAvaliacao);

// PATCH /api/avaliacoes/:id/ocultar - Ocultar/mostrar avaliação
router.patch('/:id/ocultar', AvaliacaoController.toggleOcultarAvaliacao);

export default router;

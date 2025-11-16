// src/routes/inscricaoRoutes.js
import express from 'express';
import InscricaoController from '../controllers/InscricaoController.js';

const router = express.Router();

router.post('/', InscricaoController.criarInscricao); 
router.get('/status/:cursoId/:usuarioId', InscricaoController.getStatusInscricao);
router.delete('/:id', InscricaoController.cancelarInscricao);

// GET /api/inscricoes/usuario/:usuarioId - Buscar inscrições do usuário
router.get('/usuario/:usuarioId', InscricaoController.buscarInscricoesUsuario);

// PATCH /api/inscricoes/:id/concluir - Marcar curso como concluído
router.patch('/:id/concluir', InscricaoController.concluirCurso);

export default router;
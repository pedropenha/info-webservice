// src/routes/inscricaoRoutes.js
import express from 'express';
import InscricaoController from '../controllers/InscricaoController.js';

const router = express.Router();

// POST /api/inscricoes - Criar Inscrição / Entrar na Fila de Espera
router.post('/', InscricaoController.criarInscricao); 

// GET /api/inscricoes/status/:cursoId/:usuarioId - Obtém o status de vagas e do usuário
router.get('/status/:cursoId/:usuarioId', InscricaoController.getStatusInscricao);

// GET /api/inscricoes/usuario/:usuarioId - Buscar inscrições do usuário
router.get('/usuario/:usuarioId', InscricaoController.buscarInscricoesUsuario);

// PATCH /api/inscricoes/:id/concluir - Marcar curso como concluído
router.patch('/:id/concluir', InscricaoController.concluirCurso);

export default router;
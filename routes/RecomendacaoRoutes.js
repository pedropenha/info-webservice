
import express from "express";
import RecomendacaoController from '../controllers/RecomendacaoController.js';

const router = express.Router();

router.post('/', RecomendacaoController.getCursosRecomendados);

export default router;
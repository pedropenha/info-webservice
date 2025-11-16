import express from "express";
import GeminiController from '../controllers/GeminiController.js'

const router = express.Router();

router.post('/', GeminiController.callGemini);
router.post('/descricao', GeminiController.gerarDescricaoCurso);
router.post('/proficiencias', GeminiController.gerarProficiencias);
router.post('/conteudo-programatico', GeminiController.gerarConteudoProgramatico);
router.post('/recomendacoes', GeminiController.gerarRecomendacoesCurso);
export default router;

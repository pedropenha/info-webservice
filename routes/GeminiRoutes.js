import express from "express";
import GeminiController from '../controllers/GeminiController.js'

const router = express.Router();

router.post('/', GeminiController.callGemini);
router.post('/descricao', GeminiController.gerarDescricaoCurso);
router.post('/proficiencias', GeminiController.gerarProficiencias);
router.post('/conteudo-programatico', GeminiController.gerarConteudoProgramatico);
router.post('/publico-alvo', GeminiController.gerarPublicoAlvo);
router.post('/pre-requisitos', GeminiController.gerarPreRequisitos);
router.post('/resumo-avaliacoes', GeminiController.gerarResumoAvaliacoes);

export default router;

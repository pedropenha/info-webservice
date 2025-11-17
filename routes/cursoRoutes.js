import express from 'express';
import CursoController from '../controllers/CursoController.js';

const router = express.Router();

router.get('/', CursoController.getAllCursos); 
router.get('/tags', CursoController.getDistinctTags);
router.get('/:id', CursoController.getCursoById);
router.post('/', CursoController.createCurso);
router.put('/:id', CursoController.updateCurso);
router.delete('/:id', CursoController.deleteCurso);
router.patch('/:id/concluir', CursoController.marcarComoConcluido);

export default router;

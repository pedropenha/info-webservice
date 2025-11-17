import express from 'express';
import CursoController from '../controllers/CursoController.js';

const router = express.Router();

// GET /api/cursos - Listagem de cursos com filtros
router.get('/', CursoController.getAllCursos); 

router.get('/tags', CursoController.getDistinctTags);

// GET /api/cursos/:id - Busca detalhes do curso por ID
router.get('/:id', CursoController.getCursoById);

// POST /api/cursos - Criação de um novo curso
router.post('/', CursoController.createCurso);

// PUT /api/cursos/:id - Atualização de curso
router.put('/:id', CursoController.updateCurso);

// DELETE /api/cursos/:id - Deleção de curso
router.delete('/:id', CursoController.deleteCurso);

// PATCH /api/cursos/:id/concluir - Marcar curso como concluído (Admin)
router.patch('/:id/concluir', CursoController.marcarComoConcluido);

export default router;

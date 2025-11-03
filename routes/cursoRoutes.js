// /routes/cursoRoutes.js
import express from 'express';
import CursoController from '../controllers/CursoController.js';

const router = express.Router();

// Rotas da API RESTful para o recurso /cursos

// GET /api/cursos - Listagem, Busca e Filtro
router.get('/', CursoController.getAllCursos); 

// POST /api/cursos - Criação
router.post('/', CursoController.createCurso);

// GET /api/cursos/:id - Busca por ID
router.get('/:id', CursoController.getCursoById);

// PUT /api/cursos/:id - Atualização
router.put('/:id', CursoController.updateCurso); 

// DELETE /api/cursos/:id - Deleção
router.delete('/:id', CursoController.deleteCurso);

export default router;
import express from "express";
import UserController from '../controllers/UserController.js';

const router = express.Router();

router.get('/professores', UserController.listarProfessores);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/:id/inscricoes', UserController.getUserInscricoes);
export default router;

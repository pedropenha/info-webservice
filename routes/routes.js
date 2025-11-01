import express from "express";
import CarroController from '../controllers/CarroController.js';

const router = express.Router();

router.get('/', User.find);

router.post('/', User.save);

export default router;

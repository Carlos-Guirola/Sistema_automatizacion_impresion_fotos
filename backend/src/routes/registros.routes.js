import { Router } from 'express';
import {
  aprobarRegistro,
  crearRegistro,
  listarRegistros,
} from '../controllers/registros.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarRegistros));
router.post('/', asyncHandler(crearRegistro));
router.post('/:id/aprobar', asyncHandler(aprobarRegistro));

export default router;

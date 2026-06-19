import { Router } from 'express';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  obtenerUsuario,
} from '../controllers/usuarios.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarUsuarios));
router.get('/:id', asyncHandler(obtenerUsuario));
router.post('/', asyncHandler(crearUsuario));
router.put('/:id', asyncHandler(actualizarUsuario));
router.delete('/:id', asyncHandler(eliminarUsuario));

export default router;

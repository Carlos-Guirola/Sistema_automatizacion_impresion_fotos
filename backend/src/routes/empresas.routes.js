import { Router } from 'express';
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  eliminarEmpresa,
  listarEmpresas,
  obtenerEmpresa,
} from '../controllers/empresas.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarEmpresas));
router.get('/:id', asyncHandler(obtenerEmpresa));
router.post('/', asyncHandler(crearEmpresa));
router.put('/:id', asyncHandler(actualizarEmpresa));
router.patch('/:id/estado', asyncHandler(cambiarEstadoEmpresa));
router.delete('/:id', asyncHandler(eliminarEmpresa));

export default router;

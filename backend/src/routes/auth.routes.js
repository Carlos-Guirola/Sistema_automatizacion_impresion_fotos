import { Router } from 'express';
import { login, verificarCorreo } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/verificar-correo/:token', asyncHandler(verificarCorreo));

export default router;

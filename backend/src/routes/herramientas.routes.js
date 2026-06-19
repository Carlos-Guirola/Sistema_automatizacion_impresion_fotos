import { Router } from 'express';
import {
  generarPdf,
  generarVistaPrevia,
  listarPapeles,
  obtenerLayout,
} from '../controllers/herramientas.controller.js';
import { uploadImages } from '../middlewares/uploadImages.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/papeles', listarPapeles);
router.get('/papeles/:paperSize/layout', obtenerLayout);
router.post('/layout', obtenerLayout);
router.post('/preview', uploadImages.array('imagenes'), asyncHandler(generarVistaPrevia));
router.post('/pdf', uploadImages.array('imagenes'), asyncHandler(generarPdf));
router.post('/generate-pdf', uploadImages.array('images'), asyncHandler(generarPdf));

export default router;

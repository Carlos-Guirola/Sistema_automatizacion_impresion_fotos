import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 35 * 1024 * 1024,
    files: 300,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new AppError('Solo se permiten imagenes JPG, PNG o WEBP', 400));
      return;
    }

    callback(null, true);
  },
});

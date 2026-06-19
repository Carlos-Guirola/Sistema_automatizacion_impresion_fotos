import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import empresasRoutes from './routes/empresas.routes.js';
import herramientasRoutes from './routes/herramientas.routes.js';
import registrosRoutes from './routes/registros.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

dotenv.config({ path: 'src/.env' });

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API ToolsPrint activa',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/herramientas', herramientasRoutes);
app.use('/api', herramientasRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

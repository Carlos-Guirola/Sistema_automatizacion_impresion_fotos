import pool from '../config/db.js';
import { verifyPassword } from '../services/password.service.js';
import { AppError } from '../utils/AppError.js';

const PASSWORD_COLUMN = '`contrase\u00f1a`';

export async function login(req, res) {
  const correo = (req.body.correo || req.body.usuario)?.trim().toLowerCase();
  const { contrasena } = req.body;

  if (!correo || !contrasena) {
    throw new AppError('Correo y contrasena son obligatorios');
  }

  const [usuarios] = await pool.query(
    `SELECT u.idUsuario, u.id_empresa, u.estado,
            r.id_registro, r.nombre, r.apellido, r.correo,
            ${PASSWORD_COLUMN} AS password, r.estado AS estado_registro,
            e.nombre AS empresa
     FROM usuarios u
     INNER JOIN registros r ON r.id_registro = u.id_registro
     LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
     WHERE r.correo = ? AND u.estado = 1 AND r.estado = 1`,
    [correo]
  );

  if (!usuarios.length) {
    throw new AppError('Usuario no encontrado o inactivo', 401);
  }

  const user = usuarios[0];
  const passwordIsValid = await verifyPassword(contrasena, user.password);

  if (!passwordIsValid) {
    throw new AppError('Contrasena incorrecta', 401);
  }

  res.json({
    ok: true,
    message: 'Inicio de sesion correcto',
    data: {
      idUsuario: user.idUsuario,
      id_registro: user.id_registro,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      id_empresa: user.id_empresa,
      empresa: user.empresa,
      isAdmin: user.correo === 'admin@gmail.com',
    },
  });
}

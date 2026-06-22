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
            r.id_registro, r.nombre, r.apellido, r.correo, r.fecha_registro,
            ${PASSWORD_COLUMN} AS password, r.estado AS estado_registro,
            r.correo_verificado, r.dias_acceso,
            TIMESTAMPDIFF(DAY, r.fecha_registro, NOW()) AS dias_prueba,
            e.nombre AS empresa
     FROM usuarios u
     INNER JOIN registros r ON r.id_registro = u.id_registro
     LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
     WHERE r.correo = ?`,
    [correo]
  );

  if (!usuarios.length) {
    throw new AppError('Usuario no encontrado', 401);
  }

  const user = usuarios[0];
  const isAdmin = user.correo === 'admin@gmail.com';
  const diasAcceso = Number(user.dias_acceso || 15);

  const passwordIsValid = await verifyPassword(contrasena, user.password);

  if (!passwordIsValid) {
    throw new AppError('Contrasena incorrecta', 401);
  }

  if (!isAdmin && user.dias_prueba >= diasAcceso) {
    if (user.estado === 1) {
      await pool.query(
        `UPDATE usuarios u
         INNER JOIN registros r ON r.id_registro = u.id_registro
         SET u.estado = 0, r.estado = 0
         WHERE u.idUsuario = ?`,
        [user.idUsuario]
      );
    }

    throw new AppError(
      'Tu prueba gratuita de 15 dias ha finalizado. Contacta al administrador para tener acceso de nuevo.',
      401
    );
  }

  if (user.estado_registro !== 1 || user.estado !== 1) {
    throw new AppError(
      'Usuario desactivado. Contacta al administrador para tener acceso, tu prueba gratuita ya termino.',
      401
    );
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
      isAdmin,
      correo_verificado: user.correo_verificado,
      dias_prueba: isAdmin ? null : user.dias_prueba,
      dias_acceso: isAdmin ? null : diasAcceso,
      dias_restantes: isAdmin ? null : Math.max(0, diasAcceso - user.dias_prueba),
    },
  });
}

export async function verificarCorreo(req, res) {
  const token = String(req.params.token || '').trim();

  if (!token) {
    throw new AppError('Token de verificacion invalido', 400);
  }

  const [result] = await pool.query(
    `UPDATE registros
     SET correo_verificado = 1,
         fecha_verificacion = CURRENT_TIMESTAMP,
         token_verificacion = NULL
     WHERE token_verificacion = ?`,
    [token]
  );

  if (result.affectedRows === 0) {
    throw new AppError('El enlace de verificacion no es valido o ya fue usado', 404);
  }

  res.send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Correo verificado</title>
        <style>
          body {
            align-items: center;
            background: #fff5fb;
            color: #111;
            display: flex;
            font-family: Arial, sans-serif;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
          }
          main {
            background: white;
            border: 1px solid #f9a8d4;
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(17, 17, 17, 0.12);
            max-width: 480px;
            padding: 32px;
            text-align: center;
          }
          h1 { color: #e11d74; margin-top: 0; }
          a { color: #e11d74; font-weight: 800; }
        </style>
      </head>
      <body>
        <main>
          <h1>Correo verificado</h1>
          <p>Tu correo fue confirmado correctamente. Ya puedes seguir usando ToolsPrint.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/login">Ir al login</a>
        </main>
      </body>
    </html>
  `);
}

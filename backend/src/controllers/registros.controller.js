import crypto from 'node:crypto';
import pool from '../config/db.js';
import { sendWelcomeEmail } from '../services/mail.service.js';
import { hashPassword } from '../services/password.service.js';
import { AppError } from '../utils/AppError.js';

const PASSWORD_COLUMN = '`contrase\u00f1a`';

export async function crearRegistro(req, res) {
  const { nombre, apellido, correo, telefono_whatsapp, contrasena, empresa_nombre } = req.body;

  if (!nombre || !apellido || !correo || !telefono_whatsapp || !contrasena || !empresa_nombre) {
    throw new AppError('Todos los campos del registro son obligatorios');
  }

  const cleanCorreo = correo.trim().toLowerCase();

  const [registros] = await pool.query('SELECT id_registro FROM registros WHERE correo = ?', [
    cleanCorreo,
  ]);

  if (registros.length) {
    throw new AppError('Este correo ya tiene una solicitud registrada');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const [empresaResult] = await connection.query(
      `INSERT INTO empresas (nombre, telefono, direccion, correo, estado)
       VALUES (?, NULL, NULL, ?, 1)`,
      [empresa_nombre.trim(), cleanCorreo]
    );

    const passwordHash = await hashPassword(contrasena);
    const [registroResult] = await connection.query(
      `INSERT INTO registros
        (nombre, apellido, correo, telefono_whatsapp, ${PASSWORD_COLUMN}, estado,
         correo_verificado, token_verificacion, dias_acceso)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?, 15)`,
      [
        nombre.trim(),
        apellido.trim(),
        cleanCorreo,
        telefono_whatsapp.trim(),
        passwordHash,
        verificationToken,
      ]
    );

    const [usuarioResult] = await connection.query(
      `INSERT INTO usuarios (id_registro, id_empresa, estado)
       VALUES (?, ?, 1)`,
      [registroResult.insertId, empresaResult.insertId]
    );

    await connection.commit();

    sendWelcomeEmail({
      to: cleanCorreo,
      nombre: nombre.trim(),
      token: verificationToken,
    }).catch((error) => {
      console.error('No se pudo enviar el correo de bienvenida:', error.message);
    });

    res.status(201).json({
      ok: true,
      message: 'Registro registrado con exito. No olvides tu usuario y contrasena.',
      data: {
        idUsuario: usuarioResult.insertId,
        id_registro: registroResult.insertId,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: cleanCorreo,
        id_empresa: empresaResult.insertId,
        empresa: empresa_nombre.trim(),
        isAdmin: false,
        correo_verificado: 0,
        dias_prueba: 0,
        dias_restantes: 15,
      },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listarRegistros(req, res) {
  const [registros] = await pool.query(
    `SELECT r.id_registro, r.nombre, r.apellido, r.correo, r.telefono_whatsapp,
            r.estado, r.fecha_registro, r.correo_verificado, r.fecha_verificacion,
            r.dias_acceso, r.fecha_ultima_activacion,
            COALESCE(u.id_empresa, e.id_empresa) AS id_empresa,
            COALESCE(eu.nombre, e.nombre) AS empresa
     FROM registros r
     LEFT JOIN usuarios u ON u.id_registro = r.id_registro
     LEFT JOIN empresas eu ON eu.id_empresa = u.id_empresa
     LEFT JOIN empresas e ON e.correo = r.correo
     ORDER BY r.fecha_registro DESC`
  );

  res.json({ ok: true, data: registros });
}

export async function aprobarRegistro(req, res) {
  const [registros] = await pool.query(
    `SELECT r.id_registro, r.estado,
            COALESCE(u.id_empresa, e.id_empresa) AS id_empresa,
            u.idUsuario, u.estado AS estado_usuario
     FROM registros r
     LEFT JOIN usuarios u ON u.id_registro = r.id_registro
     LEFT JOIN empresas e ON e.correo = r.correo
     WHERE r.id_registro = ?`,
    [req.params.id]
  );

  if (!registros.length) {
    throw new AppError('Registro no encontrado', 404);
  }

  const registro = registros[0];

  if (registro.estado === 1 && registro.estado_usuario === 1) {
    throw new AppError('Este usuario ya esta activo');
  }

  if (!registro.id_empresa) {
    throw new AppError('Este registro no tiene empresa asociada');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let idUsuario = registro.idUsuario;

    if (idUsuario) {
      await connection.query('UPDATE usuarios SET estado = 1 WHERE idUsuario = ?', [idUsuario]);
    } else {
      const [result] = await connection.query(
        `INSERT INTO usuarios (id_registro, id_empresa, estado)
         VALUES (?, ?, 1)`,
        [registro.id_registro, registro.id_empresa]
      );

      idUsuario = result.insertId;
    }

    await connection.query(
      `UPDATE registros
       SET estado = 1,
           dias_acceso = 30,
           fecha_registro = CURRENT_TIMESTAMP,
           fecha_ultima_activacion = CURRENT_TIMESTAMP
       WHERE id_registro = ?`,
      [registro.id_registro]
    );

    await connection.commit();

    res.json({
      ok: true,
      message: 'Usuario activado correctamente',
      data: { idUsuario },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

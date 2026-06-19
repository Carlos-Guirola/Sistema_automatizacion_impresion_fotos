import pool from '../config/db.js';
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

    await connection.query(
      `INSERT INTO empresas (nombre, telefono, direccion, correo, estado)
       VALUES (?, NULL, NULL, ?, 1)`,
      [empresa_nombre.trim(), cleanCorreo]
    );

    const passwordHash = await hashPassword(contrasena);
    const [result] = await connection.query(
      `INSERT INTO registros
        (nombre, apellido, correo, telefono_whatsapp, ${PASSWORD_COLUMN}, estado)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [nombre.trim(), apellido.trim(), cleanCorreo, telefono_whatsapp.trim(), passwordHash]
    );

    await connection.commit();

    res.status(201).json({
      ok: true,
      message: 'Registro exitoso. El administrador te contactara cuando este activo tu usuario.',
      data: { id_registro: result.insertId },
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
            r.estado, r.fecha_registro, e.id_empresa, e.nombre AS empresa
     FROM registros r
     LEFT JOIN empresas e ON e.correo = r.correo
     ORDER BY r.fecha_registro DESC`
  );

  res.json({ ok: true, data: registros });
}

export async function aprobarRegistro(req, res) {
  const [registros] = await pool.query(
    `SELECT r.id_registro, r.estado, e.id_empresa
     FROM registros r
     LEFT JOIN empresas e ON e.correo = r.correo
     WHERE r.id_registro = ?`,
    [req.params.id]
  );

  if (!registros.length) {
    throw new AppError('Registro no encontrado', 404);
  }

  const registro = registros[0];

  if (registro.estado === 1) {
    throw new AppError('Este registro ya fue aprobado');
  }

  if (!registro.id_empresa) {
    throw new AppError('Este registro no tiene empresa asociada');
  }

  const [usuarios] = await pool.query('SELECT idUsuario FROM usuarios WHERE id_registro = ?', [
    registro.id_registro,
  ]);

  if (usuarios.length) {
    throw new AppError('Este registro ya tiene un usuario creado');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO usuarios (id_registro, id_empresa, estado)
       VALUES (?, ?, 1)`,
      [registro.id_registro, registro.id_empresa]
    );

    await connection.query('UPDATE registros SET estado = 1 WHERE id_registro = ?', [
      registro.id_registro,
    ]);

    await connection.commit();

    res.json({
      ok: true,
      message: 'Registro aprobado y usuario activado correctamente',
      data: { idUsuario: result.insertId },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

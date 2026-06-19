import pool from '../config/db.js';
import { hashPassword } from '../services/password.service.js';
import { AppError } from '../utils/AppError.js';

const PASSWORD_COLUMN = '`contrase\u00f1a`';

async function validarEmpresa(idEmpresa) {
  if (!idEmpresa) return;

  const [empresas] = await pool.query(
    'SELECT id_empresa FROM empresas WHERE id_empresa = ? AND estado = 1',
    [idEmpresa]
  );

  if (!empresas.length) {
    throw new AppError('La empresa no existe o esta inactiva');
  }
}

export async function listarUsuarios(req, res) {
  const [usuarios] = await pool.query(
    `SELECT u.idUsuario, u.id_registro, u.id_empresa, u.estado, u.fecha_creacion,
            r.nombre, r.apellido, r.correo, r.telefono_whatsapp,
            e.nombre AS empresa
     FROM usuarios u
     INNER JOIN registros r ON r.id_registro = u.id_registro
     LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
     ORDER BY u.idUsuario DESC`
  );

  res.json({ ok: true, data: usuarios });
}

export async function obtenerUsuario(req, res) {
  const [usuarios] = await pool.query(
    `SELECT u.idUsuario, u.id_registro, u.id_empresa, u.estado, u.fecha_creacion,
            r.nombre, r.apellido, r.correo, r.telefono_whatsapp,
            e.nombre AS empresa
     FROM usuarios u
     INNER JOIN registros r ON r.id_registro = u.id_registro
     LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
     WHERE u.idUsuario = ?`,
    [req.params.id]
  );

  if (!usuarios.length) {
    throw new AppError('Usuario no encontrado', 404);
  }

  res.json({ ok: true, data: usuarios[0] });
}

export async function crearUsuario(req, res) {
  const {
    nombre,
    apellido,
    correo,
    telefono_whatsapp,
    contrasena,
    id_empresa = null,
    estado = 1,
  } = req.body;

  if (!nombre || !apellido || !correo || !telefono_whatsapp || !contrasena) {
    throw new AppError('Nombre, apellido, correo, WhatsApp y contrasena son obligatorios');
  }

  await validarEmpresa(id_empresa);

  const cleanCorreo = correo.trim().toLowerCase();
  const [duplicados] = await pool.query('SELECT id_registro FROM registros WHERE correo = ?', [
    cleanCorreo,
  ]);

  if (duplicados.length) {
    throw new AppError('Ese correo ya esta registrado');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const passwordHash = await hashPassword(contrasena);
    const [registroResult] = await connection.query(
      `INSERT INTO registros
        (nombre, apellido, correo, telefono_whatsapp, ${PASSWORD_COLUMN}, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido.trim(), cleanCorreo, telefono_whatsapp.trim(), passwordHash, Number(estado)]
    );

    const [usuarioResult] = await connection.query(
      `INSERT INTO usuarios (id_registro, id_empresa, estado)
       VALUES (?, ?, ?)`,
      [registroResult.insertId, id_empresa || null, Number(estado)]
    );

    await connection.commit();

    res.status(201).json({
      ok: true,
      message: 'Usuario creado correctamente',
      data: { idUsuario: usuarioResult.insertId },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function actualizarUsuario(req, res) {
  const {
    nombre,
    apellido,
    correo,
    telefono_whatsapp,
    contrasena,
    id_empresa = null,
    estado = 0,
  } = req.body;

  if (!nombre || !apellido || !correo || !telefono_whatsapp) {
    throw new AppError('Nombre, apellido, correo y WhatsApp son obligatorios');
  }

  await validarEmpresa(id_empresa);

  const cleanCorreo = correo.trim().toLowerCase();

  const [usuarios] = await pool.query('SELECT id_registro FROM usuarios WHERE idUsuario = ?', [
    req.params.id,
  ]);

  if (!usuarios.length) {
    throw new AppError('Usuario no encontrado', 404);
  }

  const idRegistro = usuarios[0].id_registro;
  const [duplicados] = await pool.query(
    'SELECT id_registro FROM registros WHERE correo = ? AND id_registro <> ?',
    [cleanCorreo, idRegistro]
  );

  if (duplicados.length) {
    throw new AppError('Ese correo ya esta registrado');
  }

  const registroParams = [
    nombre.trim(),
    apellido.trim(),
    cleanCorreo,
    telefono_whatsapp.trim(),
    Number(estado),
  ];
  let passwordSql = '';

  if (contrasena) {
    passwordSql = `, ${PASSWORD_COLUMN} = ?`;
    registroParams.push(await hashPassword(contrasena));
  }

  registroParams.push(idRegistro);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE registros
       SET nombre = ?, apellido = ?, correo = ?, telefono_whatsapp = ?, estado = ?${passwordSql}
       WHERE id_registro = ?`,
      registroParams
    );

    await connection.query(
      `UPDATE usuarios
       SET id_empresa = ?, estado = ?
       WHERE idUsuario = ?`,
      [id_empresa || null, Number(estado), req.params.id]
    );

    await connection.commit();

    res.json({ ok: true, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function eliminarUsuario(req, res) {
  const [result] = await pool.query('DELETE FROM usuarios WHERE idUsuario = ?', [
    req.params.id,
  ]);

  if (!result.affectedRows) {
    throw new AppError('Usuario no encontrado', 404);
  }

  res.json({ ok: true, message: 'Usuario eliminado correctamente' });
}

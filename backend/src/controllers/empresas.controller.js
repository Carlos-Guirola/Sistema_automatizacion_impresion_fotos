import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function listarEmpresas(req, res) {
  const [empresas] = await pool.query(
    `SELECT id_empresa, nombre, telefono, direccion, correo, estado, fecha_creacion
     FROM empresas
     ORDER BY fecha_creacion DESC`
  );

  res.json({ ok: true, data: empresas });
}

export async function obtenerEmpresa(req, res) {
  const [empresas] = await pool.query(
    `SELECT id_empresa, nombre, telefono, direccion, correo, estado, fecha_creacion
     FROM empresas
     WHERE id_empresa = ?`,
    [req.params.id]
  );

  if (!empresas.length) {
    throw new AppError('Empresa no encontrada', 404);
  }

  res.json({ ok: true, data: empresas[0] });
}

export async function crearEmpresa(req, res) {
  const { nombre, telefono = null, direccion = null, correo = null } = req.body;

  if (!nombre?.trim()) {
    throw new AppError('El nombre de la empresa es obligatorio');
  }

  const [result] = await pool.query(
    `INSERT INTO empresas (nombre, telefono, direccion, correo)
     VALUES (?, ?, ?, ?)`,
    [nombre.trim(), telefono, direccion, correo]
  );

  res.status(201).json({
    ok: true,
    message: 'Empresa creada correctamente',
    data: { id_empresa: result.insertId },
  });
}

export async function actualizarEmpresa(req, res) {
  const { nombre, telefono = null, direccion = null, correo = null, estado = 1 } = req.body;

  if (!nombre?.trim()) {
    throw new AppError('El nombre de la empresa es obligatorio');
  }

  const [result] = await pool.query(
    `UPDATE empresas
     SET nombre = ?, telefono = ?, direccion = ?, correo = ?, estado = ?
     WHERE id_empresa = ?`,
    [nombre.trim(), telefono, direccion, correo, estado, req.params.id]
  );

  if (!result.affectedRows) {
    throw new AppError('Empresa no encontrada', 404);
  }

  res.json({ ok: true, message: 'Empresa actualizada correctamente' });
}

export async function cambiarEstadoEmpresa(req, res) {
  const { estado } = req.body;

  if (![0, 1, false, true].includes(estado)) {
    throw new AppError('El estado debe ser 0 o 1');
  }

  const [result] = await pool.query(
    'UPDATE empresas SET estado = ? WHERE id_empresa = ?',
    [Number(estado), req.params.id]
  );

  if (!result.affectedRows) {
    throw new AppError('Empresa no encontrada', 404);
  }

  res.json({ ok: true, message: 'Estado actualizado correctamente' });
}

export async function eliminarEmpresa(req, res) {
  const [usuarios] = await pool.query(
    'SELECT COUNT(*) AS total FROM usuarios WHERE id_empresa = ?',
    [req.params.id]
  );

  if (usuarios[0].total > 0) {
    throw new AppError('No se puede eliminar una empresa con usuarios asociados');
  }

  const [result] = await pool.query('DELETE FROM empresas WHERE id_empresa = ?', [
    req.params.id,
  ]);

  if (!result.affectedRows) {
    throw new AppError('Empresa no encontrada', 404);
  }

  res.json({ ok: true, message: 'Empresa eliminada correctamente' });
}

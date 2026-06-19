import pool from '../config/db.js';

const columnCache = new Map();

export async function hasColumn(tableName, columnName) {
  const cacheKey = `${tableName}.${columnName}`;

  if (columnCache.has(cacheKey)) {
    return columnCache.get(cacheKey);
  }

  const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  const exists = columns.length > 0;
  columnCache.set(cacheKey, exists);

  return exists;
}

import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND status = \'active\'', [email]);
  return result.rows[0];
};

export const createUser = async (name, email, password) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, \'active\') RETURNING id, name, email, status',
    [name, email, password]
  );
  return result.rows[0];
};

// OBTENER TODOS LOS USUARIOS
export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, status FROM users ORDER BY id');
  return result.rows;
};

// ACTUALIZAR USUARIO
export const updateUser = async (id, name, email) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, status',
    [name, email, id]
  );
  return result.rows[0];
};

// CAMBIAR ESTADO DEL USUARIO
export const updateUserStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
    [status, id]
  );
  return result.rows[0];
};
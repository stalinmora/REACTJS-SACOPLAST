import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js'; // Asegúrate de que pool esté disponible
import { findUserByEmail, createUser, updateUser, updateUserStatus, getAllUsers, getUserRole, getUserPermissions, updateUserRole } from '../models/User.js';

const router = express.Router();

// CREAR USUARIO
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// OBTENER TODOS LOS USUARIOS
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// OBTENER USUARIOS CON ROLES
router.get('/with-roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// OBTENER ROLES
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM roles ORDER BY id');
    res.json({
      success: true,
      roles: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ACTUALIZAR USUARIO
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updatedUser = await updateUser(id, name, email);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// CAMBIAR ESTADO DEL USUARIO
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedUser = await updateUserStatus(id, status);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: `Usuario ${status === 'active' ? 'activado' : 'desactivado'} exitosamente`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ASIGNAR ROL A USUARIO
router.put('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id, name, email, role_id',
      [roleId, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Rol asignado exitosamente',
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
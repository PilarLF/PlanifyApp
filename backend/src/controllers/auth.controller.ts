import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    //buscamos al usuario por email y comprobamos que exista
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const user = result.rows[0];

    //se comprueba que la contraseña sea correcta
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

    //si todo es correcto, se genera un token JWT con el id y rol del usuario
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    //se devuelve el token y el rol del usuario
    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
}


export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  try {
    // 1. Comprobar si el email ya existe
    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // 2. Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, role`,
      [name, email, passwordHash, role]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export async function getEmployees(req: Request, res: Response) {
  try {
    const result = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE role = 'EMPLOYEE'"
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// ============================
// LOGIN
// ============================
export async function login(req: Request, res: Response) {
  const errors = validationResult(req); // Validación de entrada
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const payload = {
      sub: user.id,
      role: user.role,
      tokenVersion: user.token_version
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "8h"
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

// ============================
// REGISTRO (solo EMPLOYEE)
// ============================
export async function register(req: Request, res: Response) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;

  try {
    const existing = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (name, email, password, role, token_version)
       VALUES ($1, $2, $3, 'EMPLOYEE', 0)
       RETURNING id, nombre AS name, email, role`,
      [name, email, passwordHash]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

// ============================
// LISTAR EMPLEADOS
// ============================
export async function getEmployees(req: Request, res: Response) {
  try {
    const result = await pool.query(
      "SELECT id, nombre AS name, email FROM usuarios WHERE role = 'EMPLOYEE'"
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

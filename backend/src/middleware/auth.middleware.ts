import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: "Token requerido" });

  const token = header.split(" ")[1];

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const result = await pool.query(
      "SELECT token_version FROM usuarios WHERE id = $1",
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (result.rows[0].token_version !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token revocado" });
    }

    req.user = payload;
    next();

  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// =========================
// 1. Crear un nuevo horario
// =========================

export async function createHorario(req: AuthRequest, res: Response) {
  const { employee_id, start_time, end_time } = req.body;

  try {
    // Convertir a Date
    const start = new Date(start_time);
    const end = new Date(end_time);

    if (end <= start) {
      return res.status(400).json({ message: "El fin del turno debe ser posterior al inicio" });
    }

    // ============================
    // VALIDACIÓN 1: Solapamientos
    // ============================

    const solapamiento = await pool.query(
      `SELECT * FROM horarios
       WHERE employee_id = $1
       AND (
            (start_time < $3 AND end_time > $2)
       )`,
      [employee_id, start, end]
    );

    if (solapamiento.rows.length > 0) {
      return res.status(400).json({ message: "El turno se solapa con otro existente" });
    }

    // ==========================================
    // VALIDACIÓN 2: Mínimo 12 horas de descanso
    // ==========================================

    const turnoAnterior = await pool.query(
      `SELECT * FROM horarios
       WHERE employee_id = $1
       AND end_time <= $2
       ORDER BY end_time DESC
       LIMIT 1`,
      [employee_id, start]
    );

    if (turnoAnterior.rows.length > 0) {
      const lastEnd = new Date(turnoAnterior.rows[0].end_time);
      const diffHours = (start.getTime() - lastEnd.getTime()) / (1000 * 60 * 60);

      if (diffHours < 12) {
        return res.status(400).json({
          message: "Debe haber al menos 12 horas de descanso entre jornadas"
        });
      }
    }

    // ==========================================
    // VALIDACIÓN 3: Máximo 11 días consecutivos
    // ==========================================

    const consecutivos = await pool.query(
      `SELECT DATE(start_time) AS dia
       FROM horarios
       WHERE employee_id = $1
       ORDER BY dia DESC
       LIMIT 11`,
      [employee_id]
    );

    if (consecutivos.rows.length === 11) {
      const dias = consecutivos.rows.map(r => new Date(r.dia).toDateString());
      const nuevoDia = start.toDateString();

      if (!dias.includes(nuevoDia)) {
        return res.status(400).json({
          message: "No puede trabajar más de 11 días consecutivos"
        });
      }
    }

    // ============================
    // INSERTAR EL NUEVO HORARIO
    // ============================

    const result = await pool.query(
      `INSERT INTO horarios (employee_id, start_time, end_time)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employee_id, start, end]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}


// =========================
// 2. Obtener horarios por empleado
// =========================

export async function getHorariosByEmpleado(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM horarios WHERE employee_id = $1 ORDER BY start_time ASC",
      [id]
    );

    return res.json(result.rows);

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

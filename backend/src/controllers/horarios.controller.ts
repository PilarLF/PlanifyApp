import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// Utilidad para convertir datetime-local a UTC sin desfase
function toUTC(dateString: string) {
  const d = new Date(dateString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString();
}

// =========================
// 1. Crear un nuevo horario
// =========================

export async function createHorario(req: AuthRequest, res: Response) {
  const { employee_id, start_time, end_time } = req.body;

  try {
    // Convertir correctamente a UTC
    const startUTC = toUTC(start_time);
    const endUTC = toUTC(end_time);

    const start = new Date(startUTC);
    const end = new Date(endUTC);

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
      [employee_id, startUTC, endUTC]
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
      [employee_id, startUTC]
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

    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    const consecutivosRes = await pool.query(
      `SELECT DISTINCT DATE(start_time) AS dia
       FROM horarios
       WHERE employee_id = $1
         AND DATE(start_time) <= $2
       ORDER BY dia DESC
       LIMIT 11`,
      [employee_id, startDateOnly]
    );

    const existingDays = new Set<string>(
      consecutivosRes.rows.map((r: any) => {
        const d = new Date(r.dia);
        return d.toISOString().slice(0, 10);
      })
    );

    const newDayKey = startDateOnly.toISOString().slice(0, 10);
    existingDays.add(newDayKey);

    let consecutiveCount = 0;
    for (let i = 0; i < 12; i++) {
      const checkDate = new Date(startDateOnly);
      checkDate.setDate(startDateOnly.getDate() - i);
      const key = checkDate.toISOString().slice(0, 10);
      if (existingDays.has(key)) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount > 11) {
      return res.status(400).json({
        message: "No puede trabajar más de 11 días consecutivos"
      });
    }

    // ============================
    // INSERTAR EL NUEVO HORARIO
    // ============================

    const result = await pool.query(
      `INSERT INTO horarios (employee_id, start_time, end_time)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employee_id, startUTC, endUTC]
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

// =========================
// 3. Obtener todos los horarios
// =========================
export async function getAllHorarios(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      "SELECT * FROM horarios ORDER BY start_time ASC"
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

export async function updateHorario(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { start_time, end_time } = req.body;

  try {
    const startUTC = toUTC(start_time);
    const endUTC = toUTC(end_time);

    const result = await pool.query(
      `UPDATE horarios
       SET start_time = $1, end_time = $2
       WHERE id = $3
       RETURNING *`,
      [startUTC, endUTC, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }

    return res.json(result.rows[0]);

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

export async function deleteHorario(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM horarios WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }

    return res.json({ message: "Horario eliminado" });

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

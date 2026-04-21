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
    // Objetivo: contar la racha de días consecutivos que terminaría en 'start' si añadimos este turno.
    // Tomamos las fechas distintas anteriores (hasta 11) y comprobamos día a día.

    // Fecha sin hora (solo día) para comparar
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

    // Construir un Set de strings 'YYYY-MM-DD' con las fechas existentes
    const existingDays = new Set<string>(
      consecutivosRes.rows
        .map((r: any) => {
          const d = new Date(r.dia);
          // normalizar a YYYY-MM-DD
          return d.toISOString().slice(0, 10);
        })
    );

    // Simulamos que el nuevo día está presente (porque vamos a insertarlo)
    const newDayKey = startDateOnly.toISOString().slice(0, 10);
    // No hace falta añadir si ya existe, pero lo añadimos para la lógica
    existingDays.add(newDayKey);

    // Contar racha consecutiva hacia atrás desde newDayKey
    let consecutiveCount = 0;
    for (let i = 0; i < 12; i++) { // comprobamos hasta 12 para detectar >11
      const checkDate = new Date(startDateOnly);
      checkDate.setDate(startDateOnly.getDate() - i);
      const key = checkDate.toISOString().slice(0, 10);
      if (existingDays.has(key)) {
        consecutiveCount++;
      } else {
        break; // racha interrumpida
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
    const result = await pool.query(
      `UPDATE horarios
       SET start_time = $1, end_time = $2
       WHERE id = $3
       RETURNING *`,
      [start_time, end_time, id]
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

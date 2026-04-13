import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// =========================
// 1. Clock-in
// =========================

export async function clockIn(req: AuthRequest, res: Response) {
  const employee_id = req.user!.id;
  const { schedule_id } = req.body;
  const now = new Date();

  try {
    // Validar que el turno existe y pertenece al empleado
    const turno = await pool.query(
      `SELECT * FROM horarios
       WHERE id = $1 AND employee_id = $2`,
      [schedule_id, employee_id]
    );

    if (turno.rows.length === 0) {
      return res.status(400).json({ message: "Turno no válido" });
    }

    const { start_time, end_time } = turno.rows[0];

    // Validar que clock-in está dentro del turno
    if (!(now >= new Date(start_time) && now <= new Date(end_time))) {
      return res.status(400).json({ message: "No puedes fichar fuera del turno" });
    }

    // Validar que no tiene un fichaje abierto
    const abierto = await pool.query(
      `SELECT * FROM fichajes
       WHERE employee_id = $1 AND clock_out IS NULL`,
      [employee_id]
    );

    if (abierto.rows.length > 0) {
      return res.status(400).json({ message: "Ya tienes un fichaje abierto" });
    }

    // Crear fichaje
    const result = await pool.query(
      `INSERT INTO fichajes (employee_id, schedule_id, clock_in)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employee_id, schedule_id, now]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}


// =========================
// 2. Clock-out
// =========================

export async function clockOut(req: AuthRequest, res: Response) {
  const employee_id = req.user!.id;
  const now = new Date();

  try {
    // Buscar fichaje abierto
    const abierto = await pool.query(
      `SELECT * FROM fichajes
       WHERE employee_id = $1 AND clock_out IS NULL`,
      [employee_id]
    );

    if (abierto.rows.length === 0) {
      return res.status(400).json({ message: "No tienes un fichaje abierto" });
    }

    const fichaje = abierto.rows[0];

    // Calcular minutos trabajados
    const diffMinutes = Math.floor(
      (now.getTime() - new Date(fichaje.clock_in).getTime()) / (1000 * 60)
    );

    // Actualizar fichaje
    const result = await pool.query(
      `UPDATE fichajes
       SET clock_out = $1, total_minutes = $2
       WHERE id = $3
       RETURNING *`,
      [now, diffMinutes, fichaje.id]
    );

    return res.json(result.rows[0]);

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

// =========================
// 3. Status del fichaje
// =========================

export async function getStatus(req: AuthRequest, res: Response) {
  console.log('getStatus llamado, user:', req.user); 
  const employee_id = req.user!.id;

  try {
    // Buscar fichaje abierto
    const abierto = await pool.query(
      `SELECT * FROM fichajes
       WHERE employee_id = $1 AND clock_out IS NULL
       ORDER BY clock_in DESC
       LIMIT 1`,
      [employee_id]
    );

    // Buscar último fichaje cerrado
    const ultimo = await pool.query(
      `SELECT * FROM fichajes
       WHERE employee_id = $1 AND clock_out IS NOT NULL
       ORDER BY clock_out DESC
       LIMIT 1`,
      [employee_id]
    );

    return res.json({
      isClockedIn: abierto.rows.length > 0,
      lastClockIn: abierto.rows[0]?.clock_in || null,
      lastClockOut: ultimo.rows[0]?.clock_out || null
    });

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

// =========================
// 4. Turno actual: determinarlo para poder fichar 
// =========================
export async function getTurnoActual(req: AuthRequest, res: Response) {
  const employee_id = req.user!.id;
  const now = new Date();

  try {
    const result = await pool.query(
      `SELECT *
       FROM horarios
       WHERE employee_id = $1
       AND start_time <= $2
       AND end_time >= $2
       LIMIT 1`,
      [employee_id, now]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    return res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error obteniendo turno actual" });
  }
}

// =========================
// 5. Listado de los turnos de un empleado
// =========================
export async function getMisTurnos(req: AuthRequest, res: Response) {
  const employee_id = req.user!.id;

  try {
    const result = await pool.query(
      `SELECT *
       FROM horarios
       WHERE employee_id = $1
       ORDER BY start_time ASC`,
      [employee_id]
    );

    return res.json(result.rows);

  } catch (error) {
    console.error("ERROR GET MIS TURNOS:", error);
    return res.status(500).json({ message: "Error obteniendo turnos" });
  }
}

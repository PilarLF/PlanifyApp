import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

// =========================
// 1. Clock-in
// =========================


export async function clockIn(req: AuthRequest, res: Response) {
  const employee_id = req.user!.sub;
  const { schedule_id } = req.body;
  const now = new Date();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Establecer variable de sesión para el trigger (solo válida en esta tx)
    await client.query(`SET LOCAL "app.current_user" = $1`, [employee_id]);

    // Validar que el turno existe y pertenece al empleado (usar la misma conexión)
    const turnoRes = await client.query(
      `SELECT * FROM horarios WHERE id = $1 AND employee_id = $2`,
      [schedule_id, employee_id]
    );

    if (turnoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Turno no válido" });
    }

    const { start_time, end_time } = turnoRes.rows[0];

    // Validar que clock-in está dentro del turno
    if (!(now >= new Date(start_time) && now <= new Date(end_time))) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "No puedes fichar fuera del turno" });
    }

    // Validar que no tiene un fichaje abierto
    const abiertoRes = await client.query(
      `SELECT * FROM fichajes WHERE employee_id = $1 AND clock_out IS NULL`,
      [employee_id]
    );

    if (abiertoRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Ya tienes un fichaje abierto" });
    }

    // Crear fichaje (esto disparará el trigger y el trigger podrá leer app.current_user)
    const insertRes = await client.query(
      `INSERT INTO fichajes (employee_id, schedule_id, clock_in)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employee_id, schedule_id, now]
    );

    await client.query('COMMIT');
    return res.status(201).json(insertRes.rows[0]);

  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (e) { /* noop */ }
    console.error('ERROR clockIn:', error);
    return res.status(500).json({ message: "Error en el servidor" });
  } finally {
    client.release();
  }
}


// =========================
// 2. Clock-out
// =========================
export async function clockOut(req: AuthRequest, res: Response) {
  const employee_id = req.user!.sub;
  const now = new Date();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Establecer variable de sesión para el trigger
    await client.query(`SET LOCAL "app.current_user" = $1`, [employee_id]);

    // Buscar fichaje abierto en la misma conexión
    const abiertoRes = await client.query(
      `SELECT * FROM fichajes WHERE employee_id = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1`,
      [employee_id]
    );

    if (abiertoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "No tienes un fichaje abierto" });
    }

    const fichaje = abiertoRes.rows[0];

    // Calcular minutos trabajados
    const diffMinutes = Math.floor(
      (now.getTime() - new Date(fichaje.clock_in).getTime()) / (1000 * 60)
    );

    // Actualizar fichaje (dispara trigger con app.current_user disponible)
    const updateRes = await client.query(
      `UPDATE fichajes
       SET clock_out = $1, total_minutes = $2
       WHERE id = $3
       RETURNING *`,
      [now, diffMinutes, fichaje.id]
    );

    await client.query('COMMIT');
    return res.json(updateRes.rows[0]);

  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (e) { /* noop */ }
    console.error('ERROR clockOut:', error);
    return res.status(500).json({ message: "Error en el servidor" });
  } finally {
    client.release();
  }
}

// =========================
// 3. Status del fichaje
// =========================
export async function getStatus(req: AuthRequest, res: Response) {
  console.log('getStatus llamado, user:', req.user); 
  const employee_id = req.user!.sub;

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

    // Obtener nombre del empleado
    const userRes = await pool.query(
      `SELECT nombre
       FROM usuarios
       WHERE id = $1`,
      [employee_id]
    );

    const employeeName = userRes.rows[0]?.nombre || null;

    return res.json({
      isClockedIn: abierto.rows.length > 0,
      lastClockIn: abierto.rows[0]?.clock_in || null,
      lastClockOut: ultimo.rows[0]?.clock_out || null,
      employeeName
    });

  } catch (error) {
    console.error("ERROR getStatus:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}


// =========================
// 4. Turno actual: determinarlo para poder fichar 
// =========================
export async function getTurnoActual(req: AuthRequest, res: Response) {
  const employee_id = req.user!.sub;
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
  const employee_id = req.user!.sub;

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

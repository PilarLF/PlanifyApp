import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/requireAdmin';

import {
  createHorario,
  getHorariosByEmpleado,
  getAllHorarios,
  updateHorario,
  deleteHorario
} from '../controllers/horarios.controller';

const router = Router();

// Crear un horario (solo ADMIN)
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  createHorario
);

// Obtener horarios de un empleado (ADMIN o el propio empleado)
router.get(
  '/empleado/:id',
  authMiddleware,
  getHorariosByEmpleado
);

// Obtener todos los horarios (solo ADMIN)
router.get(
  '/',
  authMiddleware,
  requireAdmin,
  getAllHorarios
);

// Editar un horario (solo ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  updateHorario
);

// Eliminar un horario (solo ADMIN)
router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  deleteHorario
);

export default router;

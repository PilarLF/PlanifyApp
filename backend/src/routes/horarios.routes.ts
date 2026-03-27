import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { createHorario, getHorariosByEmpleado } from '../controllers/horarios.controller';

const router = Router();

// Crear un horario (solo ADMIN)
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  createHorario
);

// Obtener horarios de un empleado (ADMIN o el propio empleado)
router.get(
  '/empleado/:id',
  authMiddleware,
  getHorariosByEmpleado
);

export default router;

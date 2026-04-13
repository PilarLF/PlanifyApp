import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { createHorario, getHorariosByEmpleado, getAllHorarios, updateHorario, deleteHorario } from '../controllers/horarios.controller';
import { getEmployees } from '../controllers/auth.controller';

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

// obtener todos los horarios, borrarlos y editarlos (solo ADMIN)
router.get(
  '/',  
  authMiddleware,
  requireRole('ADMIN'),
  getAllHorarios);

router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  updateHorario
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  deleteHorario
);



export default router;

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { clockIn, clockOut, getStatus, getTurnoActual, getMisTurnos } from '../controllers/fichajes.controller';

const router = Router();

// Clock-in (entrada)
router.post(
  '/clock-in',
  authMiddleware,
  clockIn
);

// Clock-out (salida)
router.post(
  '/clock-out',
  authMiddleware,
  clockOut
);

// Consultar fichaje Status
router.get(
  '/status',  
  authMiddleware,
  getStatus
);

//obtener turno actual del emplead para fichar
router.get(
  '/turno-actual', 
  authMiddleware, 
  getTurnoActual
);

router.get(
  '/mis-turnos',
  authMiddleware,
  getMisTurnos
)

export default router;

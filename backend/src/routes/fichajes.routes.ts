import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { clockIn, clockOut } from '../controllers/fichajes.controller';

const router = Router();

// Clock-in (entrada)
router.post(
  '/clockin',
  authMiddleware,
  clockIn
);

// Clock-out (salida)
router.post(
  '/clockout',
  authMiddleware,
  clockOut
);

export default router;

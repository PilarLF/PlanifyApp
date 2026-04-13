import { Router } from 'express';
import { getEmployees, login, register } from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
const router = Router();

router.post('/login', login);
router.post('/register', register);

//listar empleados
router.get(
  '/employees',
  authMiddleware,
  requireRole('ADMIN'),
  getEmployees
);
export default router;

import { Router } from 'express';
import { login, register, getEmployees } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.post('/login', login);
router.post('/register', register);

// Solo admin puede ver empleados
router.get('/employees', authMiddleware, requireAdmin, getEmployees);

export default router;

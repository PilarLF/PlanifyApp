import { Router } from 'express';
import { login, register, getEmployees } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/requireAdmin';
import { body } from 'express-validator';

const router = Router();

// router.post('/login', login);
// añado validacion:
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login
);
// router.post('/register', register);
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
  ],
  register
);

// Solo admin puede ver empleados
router.get('/employees', authMiddleware, requireAdmin, getEmployees);

export default router;

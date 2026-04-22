import { Router } from 'express';
import { login, register, getEmployees } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/requireAdmin';
import { body } from 'express-validator';
import rateLimit from "express-rate-limit";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limitar a 10 intentos por IP
  message: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.'
});
// router.post('/login', login);
// añado validacion:
// router.post(
//   '/login',
//   [
//     body('email').isEmail().withMessage('Email inválido'),
//     body('password').notEmpty().withMessage('La contraseña es obligatoria')
//   ],
//   login
// );
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
router.post(
  '/login',
  loginLimiter, 
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login
);
export default router;

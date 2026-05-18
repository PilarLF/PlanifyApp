import { Router } from 'express';
import { login, register, getEmployees } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/requireAdmin';
import { body } from 'express-validator';
import rateLimit from "express-rate-limit";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ── Configuración de multer ──
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Solo se permiten imágenes'));
  }
});

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
  '/login',
  loginLimiter, 
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  login
);

router.post(
  '/register',
  upload.single('photo'),
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

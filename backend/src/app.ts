import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from "express-rate-limit";

dotenv.config();

import authRoutes from './routes/auth.routes';
import horariosRoutes from './routes/horarios.routes';
import fichajesRoutes from './routes/fichajes.routes';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limitar a 10 intentos por IP
  message: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.'
});

const app = express();
app.set('trust proxy', 1);

// 1. Configuración de CORS mejorada
// En app.ts (Backend)
app.use(cors({
  origin: 'https://planifyapphrr.netlify.app', // Pon la URL de Netlify directa para probar
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// IMPORTANTE: Manejar el preflight de forma manual si lo anterior falla
app.options('*', cors());
app.use(express.json());

// 2. BORRA la línea de /api/auth/login que tenías aquí arriba.
// Solo deja las rutas generales:
app.use('/api/auth', authRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/fichajes', fichajesRoutes);
export default app;

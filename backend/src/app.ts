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

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use('/api/auth/login',loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/fichajes', fichajesRoutes);

export default app;

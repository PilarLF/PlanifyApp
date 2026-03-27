import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import horariosRoutes from './routes/horarios.routes';
import fichajesRoutes from './routes/fichajes.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/fichajes', fichajesRoutes);

export default app;

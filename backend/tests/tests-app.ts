import express from "express";

import authRoutes from "../src/routes/auth.routes";
import fichajesRoutes from "../src/routes/fichajes.routes";
import horariosRoutes from "../src/routes/horarios.routes";

const app = express();
app.use(express.json());

// Montamos las rutas sin middlewares reales
app.use("/auth", authRoutes);
app.use("/fichajes", fichajesRoutes);
app.use("/horarios", horariosRoutes);

export default app;

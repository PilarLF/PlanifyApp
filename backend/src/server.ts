import app from './app';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';


dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

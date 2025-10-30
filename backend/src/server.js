// backend/src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import filmsRouter from './routes/films.js';
import rentalsRouter from './routes/rentals.js';
import customersRouter from './routes/customers.js';
import authRouter from './routes/auth.js';
import { verifyToken } from './middleware/authMiddleware.js';



const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/films', filmsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/customers', customersRouter);

// Not found
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});



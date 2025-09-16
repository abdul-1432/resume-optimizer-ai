import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import atsRoutes from './routes/ats.routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN, credentials: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ats', atsRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
});

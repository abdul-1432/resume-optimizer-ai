import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';

const app = createApp();

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
});

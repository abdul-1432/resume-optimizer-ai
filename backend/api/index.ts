import serverless from 'serverless-http';
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

let _handler: any;

async function getHandler() {
  if (!_handler) {
    await connectDB();
    const app = createApp();
    _handler = serverless(app);
  }
  return _handler;
}

export default async function handler(req: any, res: any) {
  const h = await getHandler();
  return h(req, res);
}

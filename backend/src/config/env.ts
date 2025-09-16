import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/login_db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h'
};

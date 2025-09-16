import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; iat: number; exp: number };
}

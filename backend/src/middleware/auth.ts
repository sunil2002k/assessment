import { RequestHandler } from 'express';
import { HttpError } from '../errors';
import { verifyAccessToken } from '../services/auth';
import type { Role } from '../types/express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

// 401: no token, expired, or invalid
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) throw new HttpError(401, 'Not authenticated');
  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
  next();
};

// 403: authenticated but wrong role. Always use after requireAuth.
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
    next();
  };

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../common/config/env.js';
import { AppError } from '../common/errors/AppError.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
    name: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Authentication token is required', 401));
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      isAdmin: !!payload.isAdmin,
      name: payload.name
    };
    next();
  } catch (err) {
    return next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user?.isAdmin) {
      return next(new AppError('Forbidden: Admin access required', 403));
    }
    next();
  });
}

// Attaches user to req if a valid token is present, but does NOT reject unauthenticated requests.
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token — proceed without user
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      isAdmin: !!payload.isAdmin,
      name: payload.name
    };
  } catch (_) {
    // Invalid token — treat as unauthenticated
  }
  next();
}

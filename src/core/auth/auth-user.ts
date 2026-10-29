import type { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  authorId: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  authorId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

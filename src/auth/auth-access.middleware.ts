// src/auth/auth-access.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthAccessMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/reset-password'];
    const isPublicRoute =  publicRoutes.some(route => req.originalUrl.startsWith(route));

    const authHeader = req.headers.authorization;
    // const token = authHeader?.split(' ')[1];
    const token = req.cookies?.access_token;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not set');

    let isAuthenticated = false;

    if (token) {
      try {
        const payload = jwt.verify(token, jwtSecret as string);
        // console.log(payload);
        req['user'] = payload;
        isAuthenticated = true;
      } catch (err) {
        isAuthenticated = false;
      }
    }
    
    // NON connecté → accès seulement aux routes publiques
    if (!isAuthenticated && !isPublicRoute) {
      return res.redirect('/auth/login');
    }

    // CONNECTÉ → empêcher accès aux routes publiques
    if (isAuthenticated && isPublicRoute) {
      return res.redirect('/'); // ⚠️ pas /auth/login ou autre route protégée
    }

    next();

  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface RequestWithUserId extends Request {
  userId?: string;
  cookies: {
    user_id?: string;
  };
}

@Injectable()
export class AssignUserIdMiddleware implements NestMiddleware {
  async use(req: RequestWithUserId, res: Response, next: NextFunction) {
    const { v4: uuidv4 } = await import('uuid');
    if (!req.cookies?.user_id) {
      const newUserId: string = uuidv4();
      res.cookie('user_id', newUserId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      });
      req.userId = newUserId;
      // await upsertUser(newUserId);
    } else {
      req.userId = req.cookies.user_id;
    }
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../service/user.service';

export interface RequestWithUserId extends Request {
    userId?: string;
    cookies: {
        userId?: string;
    };
}

@Injectable()
export class AssignUserIdMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}

    async use(req: RequestWithUserId, res: Response, next: NextFunction) {
        const { v4: uuidv4 } = await import('uuid');
        if (!req.cookies?.userId) {
            const newUserId: string = uuidv4();
            res.cookie('userId', newUserId, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/',
            });
            req.userId = newUserId;
            await this.userService.createUser(newUserId);
        } else {
            req.userId = req.cookies.userId;
        }
        next();
    }
}

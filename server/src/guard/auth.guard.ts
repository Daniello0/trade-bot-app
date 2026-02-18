import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';

export interface RequestWithUserId extends Request {
    userId?: string;
    cookies: {
        userId?: string;
    };
}

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request: RequestWithUserId = context.switchToHttp().getRequest();
        const userId: string | undefined = request.cookies['userId'];

        if (!userId) {
            throw new UnauthorizedException('Вы не авторизованы');
        }

        request.userId = userId;
        return true;
    }
}

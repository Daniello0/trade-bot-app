import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { UserCrudService } from '../service/user/user-crud.service';
import { Users } from '../entity/Users';

export interface RequestWithUserId extends Request {
    userId?: string;
    userEmail?: string;
    cookies: {
        userId?: string;
    };
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly userCrudService: UserCrudService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestWithUserId = context.switchToHttp().getRequest();
        const userId: string | undefined = request.cookies['userId'];

        if (!userId) {
            throw new UnauthorizedException('userId не найден');
        }

        const user: Users | undefined = await this.userCrudService.select({
            userId: userId,
        });

        if (!user)
            throw new UnauthorizedException('Пользователь не найден в базе');

        request.userId = userId;
        request.userEmail = user.email;

        return true;
    }
}

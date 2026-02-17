import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';
import { UserCrudService } from './user-crud.service';
import { ReadUserDto } from '../../dto/read-user.dto';
import { Users } from '../../entity/Users';

@Injectable()
export class UserAuthService {
    constructor(private readonly userCrudService: UserCrudService) {}

    async loginUser(idToken: string) {
        try {
            const decodedToken: DecodedIdToken = await admin
                .auth()
                .verifyIdToken(idToken);

            if (!decodedToken) return;

            const user: Users | undefined = await this.userCrudService.select({
                email: decodedToken.email,
            });

            const { v4: uuidv4 } = await import('uuid');
            const newUserId: string = uuidv4();

            if (!user) {
                await this.userCrudService.create(
                    decodedToken.email,
                    newUserId
                );
            } else {
                await this.userCrudService.update(decodedToken.email, {
                    id: newUserId,
                });
            }

            return newUserId;
        } catch (error) {
            throw new Error(`Ошибка при попытке залогиниться: ${error}`);
        }
    }

    async auth(userId: string | undefined): Promise<ReadUserDto | undefined> {
        try {
            if (!userId) return;

            // if userId -> select by user.session-cookie
            const user: Users | undefined = await this.userCrudService.select({
                userId: userId,
            });
            if (user) {
                return {
                    id: user.id,
                    email: user.email,
                } as ReadUserDto;
            } else return;
        } catch (error) {
            throw new UnauthorizedException(
                `Пользователь не авторизован: ${error}`
            );
        }
    }
}

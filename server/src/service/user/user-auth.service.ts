import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { UserCrudService } from './user-crud.service';
import { ReadUserDto } from '../../dto/read-user.dto';
import { Users } from '../../entity/Users';
import { FirebaseService } from '../../auth/firebase-init.auth';

// refactor: more decomposition
@Injectable()
export class UserAuthService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly userCrudService: UserCrudService
    ) {}

    async loginUser(idToken: string) {
        try {
            const decodedToken: DecodedIdToken = await this.firebaseService
                .getAuth()
                .verifyIdToken(idToken);
            const decodedUser: UserRecord = await this.firebaseService
                .getAuth()
                .getUser(decodedToken.uid);

            if (!decodedToken) return;

            const { v4: uuidv4 } = await import('uuid');
            const newUserId: string = uuidv4();

            const user: Users | undefined = await this.userCrudService.select({
                email: decodedToken.email,
            });

            if (!user) {
                await this.userCrudService.create(
                    decodedToken.email,
                    decodedUser.displayName,
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

            const user: Users | undefined = await this.userCrudService.select({
                userId: userId,
            });
            if (user) {
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                } as ReadUserDto;
            } else return;
        } catch (error) {
            throw new UnauthorizedException(
                `Пользователь не авторизован: ${error}`
            );
        }
    }
}

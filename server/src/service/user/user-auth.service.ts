import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { Auth, DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { UserCrudService } from './user-crud.service';
import { ReadUserDto } from '../../dto/read-user.dto';
import { Users } from '../../entity/Users';
import { FirebaseService } from '../../auth/firebase-init.auth';

@Injectable()
export class UserAuthService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly userCrudService: UserCrudService
    ) {}

    async loginUser(idToken: string): Promise<string> {
        try {
            const { email, displayName } =
                await this.verifyFirebaseUser(idToken);

            const { v4: uuidv4 } = await import('uuid');
            const newId: string = uuidv4();

            await this.syncUserInDatabase(email, displayName, newId);

            return newId;
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;

            throw new InternalServerErrorException(`Login failed: ${error}`);
        }
    }

    async auth(userId: string | undefined): Promise<ReadUserDto | undefined> {
        if (!userId) return undefined;

        const user: Users | undefined = await this.userCrudService.select({
            userId,
        });
        if (!user) {
            throw new UnauthorizedException('User session not found');
        }

        return this.mapToReadDto(user);
    }

    private mapToReadDto(user: Users): ReadUserDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

    private async syncUserInDatabase(
        email: string | undefined,
        name: string,
        newId: string
    ): Promise<void> {
        const existingUser: Users | undefined =
            await this.userCrudService.select({ email });

        if (!existingUser) {
            await this.userCrudService.create(email, name, newId);
        } else {
            await this.userCrudService.update(email, { id: newId });
        }
    }

    private async verifyFirebaseUser(idToken: string) {
        try {
            const auth: Auth = this.firebaseService.getAuth();
            const decodedToken: DecodedIdToken =
                await auth.verifyIdToken(idToken);
            const firebaseUser: UserRecord = await auth.getUser(
                decodedToken.uid
            );

            return {
                email: decodedToken.email,
                displayName: firebaseUser.displayName || 'Anonymous',
            };
        } catch (error) {
            throw new UnauthorizedException(`Invalid Firebase token: ${error}`);
        }
    }
}

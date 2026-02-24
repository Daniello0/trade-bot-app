import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { UserAuthController } from '../controller/user-auth.controller';
import { UserAuthService } from '../service/user/user-auth.service';
import { FirebaseService } from '../auth/firebase-init.auth';

@Module({
    imports: [UserModule],
    controllers: [UserAuthController],
    providers: [UserAuthService, FirebaseService],
})
export class AuthModule {}

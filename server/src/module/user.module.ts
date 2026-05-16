import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entity/Users';
import { UserController } from '../controllers/user.controller';
import { UserKeysService } from '../service/user/user-keys.service';
import { CryptoService } from '../service/cryptography/crypto.service';
import { UserCrudService } from '../service/user/user-crud.service';

@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    controllers: [UserController],
    providers: [UserKeysService, UserCrudService, CryptoService],
    exports: [UserKeysService, UserCrudService],
})
export class UserModule {}

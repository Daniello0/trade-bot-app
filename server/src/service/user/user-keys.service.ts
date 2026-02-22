import { Injectable } from '@nestjs/common';
import { CryptoService } from '../cryptography/crypto.service';
import { DatabaseService } from '../database/init-typeorm';
import { Users } from '../../entity/Users';
import { UserCrudService } from './user-crud.service';

@Injectable()
export class UserKeysService {
    constructor(
        private readonly cryptoService: CryptoService,
        private readonly userCrudService: UserCrudService
    ) {}

    async saveApiKeys(
        userId: string | undefined,
        apiKey: string,
        secretKey: string
    ) {
        if (!userId) throw new Error('User id is not defined.');

        const encryptedApiKey = this.cryptoService.encrypt(apiKey);
        const encryptedSecretKey = this.cryptoService.encrypt(secretKey);

        const userRepository = DatabaseService.getRepository(Users);
        await userRepository.update(userId, {
            apiKey: encryptedApiKey,
            apiSecret: encryptedSecretKey,
        });
    }

    async getApiKeys(
        userId: string | undefined
    ): Promise<{ apiKey: string; apiSecret: string }> {
        if (!userId) throw new Error('User id is not defined.');

        const user: Users | undefined = await this.userCrudService.select({
            userId: userId,
        });

        if (!user) {
            throw new Error(`User with id "${userId}" not found.`);
        }

        const apiKey: string = this.cryptoService.decrypt(user.apiKey);
        const apiSecret: string = this.cryptoService.decrypt(user.apiSecret);

        return { apiKey, apiSecret };
    }
}

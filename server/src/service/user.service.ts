import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { DatabaseService } from '../database-service/init-typeorm';
import { Users } from '../entity/Users';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(private readonly cryptoService: CryptoService) {}

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
            api_key: encryptedApiKey,
            api_secret: encryptedSecretKey,
        });
    }

    async getApiKeys(
        userId: string | undefined
    ): Promise<{ api_key: string; api_secret: string }> {
        if (!userId) throw new Error('User id is not defined.');

        const userRepository: Repository<Users> =
            DatabaseService.getRepository(Users);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) throw new Error('User not found');

        const api_key = this.cryptoService.decrypt(user.api_key);
        const api_secret = this.cryptoService.decrypt(user.api_secret);

        return { api_key, api_secret };
    }

    async createUser(userId: string) {
        await DatabaseService.manager.save(Users, {
            id: userId,
        });
    }
}

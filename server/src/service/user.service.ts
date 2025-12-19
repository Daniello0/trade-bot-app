import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { DatabaseService } from '../database-service/init-typeorm';
import { Users } from '../entity/Users';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(private readonly cryptoService: CryptoService) {}

    async saveApiKeys(userId: string, apiKey: string, secretKey: string) {
        const encryptedApiKey = this.cryptoService.encrypt(apiKey);
        const encryptedSecretKey = this.cryptoService.encrypt(secretKey);

        const userRepository = DatabaseService.getRepository(Users);
        await userRepository.update(userId, {
            api_key: encryptedApiKey,
            api_secret: encryptedSecretKey,
        });
    }

    async getApiKeys(
        userId: string
    ): Promise<{ api_key: string; api_secret: string }> {
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

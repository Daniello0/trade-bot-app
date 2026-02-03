import { Injectable } from '@nestjs/common';
import { CryptoService } from '../cryptography/crypto.service';
import { DatabaseService } from '../database/init-typeorm';
import { Users } from '../../entity/Users';
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
            apiKey: encryptedApiKey,
            apiSecret: encryptedSecretKey,
        });
    }

    async getApiKeys(
        userId: string | undefined
    ): Promise<{ apiKey: string; apiSecret: string }> {
        if (!userId) throw new Error('User id is not defined.');

        const user: Users | null = await this.getUser(userId);

        const apiKey: string = this.cryptoService.decrypt(user.apiKey);
        const apiSecret: string = this.cryptoService.decrypt(user.apiSecret);

        return { apiKey, apiSecret };
    }

    async createUser(userId: string) {
        await DatabaseService.manager.save(Users, {
            id: userId,
            apiKey: this.cryptoService.encrypt(''),
            apiSecret: this.cryptoService.encrypt(''),
        });
    }

    private async getUser(userId: string): Promise<Users> {
        const userRepository: Repository<Users> =
            DatabaseService.getRepository(Users);

        const user: Users | null = await userRepository.findOneBy({
            id: userId,
        });

        if (!user) throw new Error('User not found');

        return user;
    }
}

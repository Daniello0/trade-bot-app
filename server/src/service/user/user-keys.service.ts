import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CryptoService } from '../cryptography/crypto.service';
import { Users } from '../../entity/Users';
import { UserCrudService } from './user-crud.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserKeysService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        private readonly cryptoService: CryptoService,
        private readonly userCrudService: UserCrudService
    ) {}

    async saveApiKeys(
        userId: string | undefined,
        apiKey: string,
        secretKey: string
    ) {
        const validId: string = this.getValidUserId(userId);
        const updateData: Partial<Users> = {};

        if (apiKey) updateData.apiKey = this.cryptoService.encrypt(apiKey);
        if (secretKey)
            updateData.apiSecret = this.cryptoService.encrypt(secretKey);

        if (Object.keys(updateData).length > 0) {
            await this.usersRepository.update(validId, updateData);
        }
    }

    async getApiKeys(
        userId: string | undefined
    ): Promise<{ apiKey: string; apiSecret: string }> {
        const validId: string = this.getValidUserId(userId);

        const user: Users | undefined = await this.userCrudService.select({
            userId: validId,
        });
        if (!user) {
            throw new NotFoundException(`User with id "${validId}" not found.`);
        }

        return {
            apiKey: this.cryptoService.decrypt(user.apiKey),
            apiSecret: this.cryptoService.decrypt(user.apiSecret),
        };
    }

    private getValidUserId(userId: string | undefined): string {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }
        return userId;
    }
}

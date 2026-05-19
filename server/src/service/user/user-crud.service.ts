import { Injectable, NotFoundException } from '@nestjs/common';
import { Users } from '../../entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CryptoService } from '../cryptography/crypto.service';

// TODO: extends Repository<Users>
// SMELL: OOP – Refusal of Bequest (latent — TODO extends Repository)
@Injectable()
export class UserCrudService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        private readonly cryptoService: CryptoService
    ) {}

    async select(data: {
        email?: string;
        userId?: string;
    }): Promise<Users | undefined> {
        try {
            const where = data.email
                ? { email: data.email }
                : { id: data.userId };

            return (await this.usersRepository.findOne({ where })) ?? undefined;
        } catch (error) {
            throw new Error(`Ошибка при попытке найти пользователя: ${error}`);
        }
    }

    async create(
        email: string | undefined,
        name: string,
        id: string
    ): Promise<Users> {
        const newUser: Users = this.usersRepository.create({
            id,
            email,
            name,
            apiKey: this.cryptoService.encrypt(''),
            apiSecret: this.cryptoService.encrypt(''),
        });

        return await this.usersRepository.save(newUser);
    }

    async update(
        email: string | undefined,
        updateData: Partial<Users>
    ): Promise<void> {
        if (!email) throw new Error('Email is required for update');

        const result: UpdateResult = await this.usersRepository.update(
            { email },
            updateData
        );

        if (result.affected === 0) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
    }
}

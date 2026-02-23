import { Injectable } from '@nestjs/common';
import { Users } from '../../entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../cryptography/crypto.service';

@Injectable()
export class UserCrudService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,

        private readonly cryptoService: CryptoService
    ) {}

    // refactor: more decomposition
    async select(data: {
        email?: string;
        userId?: string;
    }): Promise<Users | undefined> {
        try {
            let res: Users | null;
            if (data.email) {
                res = await this.usersRepository.findOne({
                    where: { email: data.email },
                });
            } else {
                res = await this.usersRepository.findOne({
                    where: { id: data.userId },
                });
            }

            if (res) return res;
            else return;
        } catch (error) {
            throw new Error(`Ошибка при попытке найти пользователя: ${error}`);
        }
    }

    async create(
        email: string | undefined,
        name: string | undefined,
        newUserId: string
    ) {
        const newUser: Users = this.usersRepository.create({
            id: newUserId,
            email: email,
            name: name,
            apiKey: this.cryptoService.encrypt(''),
            apiSecret: this.cryptoService.encrypt(''),
        });
        await this.usersRepository.save(newUser);
    }

    async update(email: string | undefined, data: { id: string }) {
        if (!email) throw new Error('Email не определен');
        await this.usersRepository.update(
            { email: email },
            {
                id: data.id,
            }
        );
    }
}

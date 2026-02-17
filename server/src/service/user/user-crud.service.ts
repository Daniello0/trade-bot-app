import { Injectable } from '@nestjs/common';
import { Users } from '../../entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserCrudService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ) {}

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

    async create(email: string | undefined, newUserId: string) {
        const newUser: Users = this.usersRepository.create({
            id: newUserId,
            email: email,
        });
        await this.usersRepository.save(newUser);
    }

    async update(email: string | undefined, data: { id: string }) {
        if (!email) throw new Error('Email не определен');
        await this.usersRepository.update(email, {
            id: data.id,
        });
    }
}

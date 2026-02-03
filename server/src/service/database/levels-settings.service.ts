import { EntityManager, Repository } from 'typeorm';
import { LevelsSettings } from '../../entity/LevelsSettings';
import { CreateLevelsSettingsDto } from '../../dto/create-levels-settings.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LevelsSettingsService {
    constructor(
        @InjectRepository(LevelsSettings)
        private readonly levelsRepository: Repository<LevelsSettings>
    ) {}

    async create(
        levelsSettings: CreateLevelsSettingsDto,
        manager?: EntityManager
    ): Promise<LevelsSettings> {
        const repository: Repository<LevelsSettings> = manager
            ? manager.getRepository(LevelsSettings)
            : this.levelsRepository;
        const newSettings: LevelsSettings = repository.create(levelsSettings);
        return await repository.save(newSettings);
    }

    async update(
        levelsSettingsId: number,
        updateData: CreateLevelsSettingsDto,
        manager?: EntityManager
    ): Promise<void> {
        const repository: Repository<LevelsSettings> = manager
            ? manager.getRepository(LevelsSettings)
            : this.levelsRepository;
        await repository.update(levelsSettingsId, updateData);
    }
}

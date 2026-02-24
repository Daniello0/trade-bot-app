import { EntityManager, Repository } from 'typeorm';
import { SpotGridSettings } from '../../entity/SpotGridSettings';
import { GridSettingsService } from './grid-settings.service';
import { LevelsSettingsService } from './levels-settings.service';
import { CreateSpotGridSettingsDto } from '../../dto/create-spot-grid-settings.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SpotGridSettingsService {
    constructor(
        @InjectRepository(SpotGridSettings)
        private readonly spotGridRepository: Repository<SpotGridSettings>,

        private readonly gridSettingsService: GridSettingsService,
        private readonly levelsSettingsService: LevelsSettingsService
    ) {}

    async create(
        dto: CreateSpotGridSettingsDto,
        manager?: EntityManager
    ): Promise<SpotGridSettings> {
        const repo: Repository<SpotGridSettings> = this.getRepo(manager);

        const [grid, levels] = await Promise.all([
            this.gridSettingsService.create(dto.gridSettings, manager),
            this.levelsSettingsService.create(dto.levelsSettings, manager),
        ]);

        const newSettings: SpotGridSettings = repo.create({
            candleLength: dto.candleLength,
            crypto: dto.crypto,
            gridSettings: grid,
            levelsSettings: levels,
        });

        return await repo.save(newSettings);
    }

    async update(
        id: number,
        userId: string,
        dto: CreateSpotGridSettingsDto,
        manager?: EntityManager
    ): Promise<void> {
        const repo: Repository<SpotGridSettings> = this.getRepo(manager);

        const existing: SpotGridSettings = await this.findOrThrow(
            id,
            userId,
            manager
        );

        const { gridSettings, levelsSettings, ...spotGridFields } = dto;

        await Promise.all([
            this.gridSettingsService.update(
                existing.gridSettings.id,
                gridSettings,
                manager
            ),
            this.levelsSettingsService.update(
                existing.levelsSettings.id,
                levelsSettings,
                manager
            ),
            repo.update(id, spotGridFields),
        ]);
    }

    private getRepo(manager?: EntityManager): Repository<SpotGridSettings> {
        return manager
            ? manager.getRepository(SpotGridSettings)
            : this.spotGridRepository;
    }

    private async findOrThrow(
        id: number,
        userId: string,
        manager?: EntityManager
    ): Promise<SpotGridSettings> {
        const settings: SpotGridSettings | null = await this.getRepo(
            manager
        ).findOne({
            where: {
                id,
                bot: { user: { id: userId } },
            },
            relations: { gridSettings: true, levelsSettings: true },
        });

        if (!settings) {
            throw new NotFoundException(
                `SpotGridSettings #${id} not found or access denied.`
            );
        }

        return settings;
    }
}

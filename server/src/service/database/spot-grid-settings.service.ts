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
        spotGridSettingsData: CreateSpotGridSettingsDto,
        manager?: EntityManager
    ): Promise<SpotGridSettings> {
        const spotGridRepository: Repository<SpotGridSettings> = manager
            ? manager.getRepository(SpotGridSettings)
            : this.spotGridRepository;

        const savedGridSettings = await this.gridSettingsService.create(
            spotGridSettingsData.gridSettings,
            manager
        );
        const savedLevelsSettings = await this.levelsSettingsService.create(
            spotGridSettingsData.levelsSettings,
            manager
        );

        const newSettings: SpotGridSettings = spotGridRepository.create({
            candleLength: spotGridSettingsData.candleLength,
            crypto: spotGridSettingsData.crypto,

            gridSettings: savedGridSettings,
            levelsSettings: savedLevelsSettings,
        });

        return await spotGridRepository.save(newSettings);
    }

    async update(
        spotGridSettingsId: number,
        userId: string,
        updateData: CreateSpotGridSettingsDto,
        manager?: EntityManager
    ): Promise<void> {
        const repository = manager
            ? manager.getRepository(SpotGridSettings)
            : this.spotGridRepository;

        const settingsToUpdate: SpotGridSettings | null =
            await this.getSpotGridSettingsToUpdate(
                repository,
                spotGridSettingsId,
                userId
            );

        const { gridSettings, levelsSettings, ...spotGridFields } = updateData;

        await this.gridSettingsService.update(
            settingsToUpdate.gridSettings.id,
            gridSettings,
            manager
        );
        await this.levelsSettingsService.update(
            settingsToUpdate.levelsSettings.id,
            levelsSettings,
            manager
        );

        await repository.update(spotGridSettingsId, spotGridFields);
    }

    private async getSpotGridSettingsToUpdate(
        repository: Repository<SpotGridSettings>,
        spotGridSettingsId: number,
        userId: string
    ) {
        const settingsToUpdate: SpotGridSettings | null =
            await repository.findOne({
                where: {
                    id: spotGridSettingsId,
                    bot: { user: { id: userId } },
                },
                relations: { gridSettings: true, levelsSettings: true },
            });

        if (!settingsToUpdate) {
            throw new NotFoundException(
                `SpotGridSettings with ID "${spotGridSettingsId}" not found or permission denied.`
            );
        }

        return settingsToUpdate;
    }
}

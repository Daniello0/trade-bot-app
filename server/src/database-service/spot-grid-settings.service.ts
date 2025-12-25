import { EntityManager, Repository } from 'typeorm';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import { GridSettingsService } from './grid-settings.service';
import { LevelsSettingsService } from './levels-settings.service';
import { CreateSpotGridSettingsDto } from '../dto/create-spot-grid-settings.dto';
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
            spotGridSettingsData.grid_settings,
            manager
        );
        const savedLevelsSettings = await this.levelsSettingsService.create(
            spotGridSettingsData.levels_settings,
            manager
        );

        const newSettings: SpotGridSettings = spotGridRepository.create({
            history_length: spotGridSettingsData.history_length,
            candle_length: spotGridSettingsData.candle_length,
            crypto: spotGridSettingsData.crypto,
            stop_loss_type: spotGridSettingsData.stop_loss_type,
            update_grid_interval_type:
                spotGridSettingsData.update_grid_interval_type,
            update_grid_interval_time:
                spotGridSettingsData.update_grid_interval_time,

            grid_settings: savedGridSettings,
            levels_settings: savedLevelsSettings,
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

        const settingsToUpdate = await repository.findOne({
            where: { id: spotGridSettingsId, bot: { user: { id: userId } } },
            relations: { grid_settings: true, levels_settings: true },
        });

        if (!settingsToUpdate) {
            throw new NotFoundException(
                `SpotGridSettings with ID "${spotGridSettingsId}" not found or permission denied.`
            );
        }

        const { grid_settings, levels_settings, ...spotGridFields } =
            updateData;

        await this.gridSettingsService.update(
            settingsToUpdate.grid_settings.id,
            grid_settings,
            manager
        );
        await this.levelsSettingsService.update(
            settingsToUpdate.levels_settings.id,
            levels_settings,
            manager
        );

        await repository.update(spotGridSettingsId, spotGridFields);
    }
}

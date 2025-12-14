import { EntityManager } from 'typeorm';
import { DatabaseService } from '../../InitTypeOrm';
import { SpotGridSettings } from '../../entity/grid_spot/SpotGridSettings';
import { createGridSettings, updateGridSettings } from './GridSettingsService';
import {
    createLevelsSettings,
    updateLevelsSettings,
} from './LevelsSettingsService';
import { GridSettings } from '../../entity/grid_spot/GridSettings';
import { LevelsSettings } from '../../entity/grid_spot/LevelsSettings';
import { CreateSpotGridSettingsDto } from '../../../../dto/create_dto/spot_grid/create-spot-grid-settings.dto';
import { NotFoundException } from '@nestjs/common';

export const createSpotGridSettings = async (
    spotGridSettingsData: CreateSpotGridSettingsDto,
    manager?: EntityManager
): Promise<SpotGridSettings> => {
    const entityManager: EntityManager = manager || DatabaseService.manager;

    const savedGridSettings: GridSettings = await createGridSettings(
        spotGridSettingsData.grid_settings,
        entityManager
    );

    const savedLevelsSettings: LevelsSettings = await createLevelsSettings(
        spotGridSettingsData.levels_settings,
        entityManager
    );

    const newSettings: SpotGridSettings = entityManager.create(
        SpotGridSettings,
        {
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
        }
    );

    return await entityManager.save(newSettings);
};

export const updateSpotGridSettings = async (
    spotGridSettingsId: number,
    userId: string,
    updateData: CreateSpotGridSettingsDto,
    manager?: EntityManager
): Promise<void> => {
    const entityManager = manager || DatabaseService.manager;

    const settingsToUpdate = await entityManager.findOne(SpotGridSettings, {
        where: {
            id: spotGridSettingsId,
            bot: { user: { id: userId } },
        },
        relations: {
            grid_settings: true,
            levels_settings: true,
        },
    });

    if (!settingsToUpdate) {
        throw new NotFoundException(
            `SpotGridSettings with ID "${spotGridSettingsId}" not found or permission denied.`
        );
    }

    const { grid_settings, levels_settings, ...spotGridFields } = updateData;

    await updateGridSettings(
        settingsToUpdate.grid_settings.id,
        grid_settings,
        entityManager
    );
    await updateLevelsSettings(
        settingsToUpdate.levels_settings.id,
        levels_settings,
        entityManager
    );

    await entityManager.update(
        SpotGridSettings,
        spotGridSettingsId,
        spotGridFields
    );
};

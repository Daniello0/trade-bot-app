import { EntityManager } from 'typeorm';
import { DatabaseService } from './init-typeorm';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import {
    createGridSettings,
    updateGridSettings,
} from './grid-settings.service';
import {
    createLevelsSettings,
    updateLevelsSettings,
} from './levels-settings.service';
import { GridSettings } from '../entity/GridSettings';
import { LevelsSettings } from '../entity/LevelsSettings';
import { CreateSpotGridSettingsDto } from '../dto/create-spot-grid-settings.dto';
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

    const newSettings: SpotGridSettings = createSavedSpotGridSettings(
        entityManager,
        spotGridSettingsData,
        savedGridSettings,
        savedLevelsSettings
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

    const settingsToUpdate = await getSpotGridSettings(
        spotGridSettingsId,
        userId,
        entityManager
    );

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

const createSavedSpotGridSettings = (
    entityManager: EntityManager,
    spotGridSettingsData: CreateSpotGridSettingsDto,
    savedGridSettings: GridSettings,
    savedLevelsSettings: LevelsSettings
) => {
    return entityManager.create(SpotGridSettings, {
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
};

const getSpotGridSettings = async (
    spotGridSettingsId: number,
    userId: string,
    entityManager: EntityManager
) => {
    return await entityManager.findOne(SpotGridSettings, {
        where: {
            id: spotGridSettingsId,
            bot: { user: { id: userId } },
        },
        relations: {
            grid_settings: true,
            levels_settings: true,
        },
    });
};

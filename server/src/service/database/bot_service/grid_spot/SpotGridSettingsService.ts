import { EntityManager } from 'typeorm';
import { DatabaseService } from '../../InitTypeOrm';
import { SpotGridSettings } from '../../entity/grid_spot/SpotGridSettings';
import { createGridSettings } from './GridSettingsService';
import { createLevelsSettings } from './LevelsSettingsService';
import { GridSettings } from '../../entity/grid_spot/GridSettings';
import { LevelsSettings } from '../../entity/grid_spot/LevelsSettings';
import { CreateSpotGridSettingsDto } from '../../../../dto/create_dto/spot_grid/create-spot-grid-settings.dto';

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

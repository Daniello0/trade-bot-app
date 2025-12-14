import { EntityManager } from 'typeorm';
import { DatabaseService } from '../../InitTypeOrm';
import { LevelsSettings } from '../../entity/grid_spot/LevelsSettings';
import { CreateLevelsSettingsDto } from '../../../../dto/create_dto/spot_grid/create-levels-settings.dto';

export const createLevelsSettings = async (
    levelsSettings: CreateLevelsSettingsDto,
    manager?: EntityManager
): Promise<LevelsSettings> => {
    const entityManager = manager || DatabaseService.manager;

    const newSettings: LevelsSettings = entityManager.create(
        LevelsSettings,
        levelsSettings
    );

    return await entityManager.save(newSettings);
};

export const updateLevelsSettings = async (
    levelsSettingsId: number,
    updateData: CreateLevelsSettingsDto,
    manager?: EntityManager
): Promise<void> => {
    const entityManager = manager || DatabaseService.manager;

    await entityManager.update(LevelsSettings, levelsSettingsId, updateData);
};

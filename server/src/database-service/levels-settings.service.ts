import { EntityManager } from 'typeorm';
import { DatabaseService } from './init-typeorm';
import { LevelsSettings } from '../entity/LevelsSettings';
import { CreateLevelsSettingsDto } from '../dto/create-levels-settings.dto';

export const createLevelsSettings = async (
    levelsSettings: CreateLevelsSettingsDto,
    manager?: EntityManager
): Promise<LevelsSettings> => {
    const entityManager: EntityManager = manager || DatabaseService.manager;

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
    const entityManager: EntityManager = manager || DatabaseService.manager;

    await entityManager.update(LevelsSettings, levelsSettingsId, updateData);
};

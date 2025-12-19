import { DatabaseService } from './init-typeorm';
import { GridSettings } from '../entity/GridSettings';
import { EntityManager } from 'typeorm';
import { CreateGridSettingsDto } from '../dto/create-grid-settings.dto';

// todo repository
export const createGridSettings = async (
    gridSettings: CreateGridSettingsDto,
    manager?: EntityManager
): Promise<GridSettings> => {
    const entityManager: EntityManager = manager || DatabaseService.manager;

    const newSettings: GridSettings = entityManager.create(
        GridSettings,
        gridSettings
    );

    return await entityManager.save(newSettings);
};

export const updateGridSettings = async (
    gridSettingsId: number,
    updateData: CreateGridSettingsDto,
    manager?: EntityManager
): Promise<void> => {
    const entityManager: EntityManager = manager || DatabaseService.manager;

    await entityManager.update(GridSettings, gridSettingsId, updateData);
};

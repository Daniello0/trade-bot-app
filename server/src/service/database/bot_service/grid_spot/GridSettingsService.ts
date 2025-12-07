import { DatabaseService } from '../../InitTypeOrm';
import { GridSettings } from '../../entity/grid_spot/GridSettings';
import { EntityManager } from 'typeorm';

export type gridSettingsType = {
    id?: number;
    type: string;
    lower_bound_static?: number;
    upper_bound_static?: number;
    lower_bound_dynamic?: string;
    upper_bound_dynamic?: string;
};

export const createGridSettings = async (
    gridSettings: gridSettingsType,
    manager?: EntityManager
): Promise<GridSettings> => {
    const entityManager = manager || DatabaseService.manager;

    const newSettings: GridSettings = entityManager.create(
        GridSettings,
        gridSettings
    );

    return await entityManager.save(newSettings);
};

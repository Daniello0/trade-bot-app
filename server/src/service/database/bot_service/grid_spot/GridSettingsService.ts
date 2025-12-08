import { DatabaseService } from '../../InitTypeOrm';
import { GridSettings } from '../../entity/grid_spot/GridSettings';
import { EntityManager } from 'typeorm';
import { CreateGridSettingsDto } from '../../../../dto/create_dto/spot_grid/create-grid-settings.dto';

export const createGridSettings = async (
    gridSettings: CreateGridSettingsDto,
    manager?: EntityManager
): Promise<GridSettings> => {
    const entityManager = manager || DatabaseService.manager;

    const newSettings: GridSettings = entityManager.create(
        GridSettings,
        gridSettings
    );

    return await entityManager.save(newSettings);
};

import { EntityManager } from 'typeorm';
import { DatabaseService } from '../../InitTypeOrm';
import { LevelsSettings } from '../../entity/grid_spot/LevelsSettings';

export type levelsSettingsType = {
    id?: number;
    type: string;
    count_static?: number;
    price_per_bet_static?: number;
    profit_dynamic?: number;
};

export const createLevelsSettings = async (
    levelsSettings: levelsSettingsType,
    manager?: EntityManager
): Promise<LevelsSettings> => {
    const entityManager = manager || DatabaseService.manager;

    const newSettings: LevelsSettings = entityManager.create(
        LevelsSettings,
        levelsSettings
    );

    return await entityManager.save(newSettings);
};

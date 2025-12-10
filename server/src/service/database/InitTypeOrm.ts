import { DataSource } from 'typeorm';
import * as process from 'node:process';
import { Users } from './entity/Users';
import * as console from 'node:console';
import { Bots } from './entity/Bots';
import { SpotGridSettings } from './entity/grid_spot/SpotGridSettings';
import { LevelsSettings } from './entity/grid_spot/LevelsSettings';
import { GridSettings } from './entity/grid_spot/GridSettings';
import { FullSpotSettings } from './entity/full_spot/FullSpotSettings';
import { StopLossSettings } from './entity/full_spot/StopLossSettings';

export const DatabaseService = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'tradeBotApp',
    entities: [
        Users,
        Bots,
        SpotGridSettings,
        LevelsSettings,
        GridSettings,
        FullSpotSettings,
        StopLossSettings,
    ],
    synchronize: true,
    logging: false,
});

export const initTypeOrm = async () => {
    try {
        await DatabaseService.initialize();
    } catch (error) {
        console.log(error);
        throw error;
    }
};

import { DataSource } from 'typeorm';
import * as process from 'node:process';
import { Users } from '../../entity/Users';
import * as console from 'node:console';
import { Bots } from '../../entity/Bots';
import { SpotGridSettings } from '../../entity/SpotGridSettings';
import { LevelsSettings } from '../../entity/LevelsSettings';
import { GridSettings } from '../../entity/GridSettings';

export const DatabaseService = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'tradeBotApp', // TODO
    entities: [Users, Bots, SpotGridSettings, LevelsSettings, GridSettings],
    synchronize: true,
    logging: false,
});

export const initTypeorm = async () => {
    try {
        await DatabaseService.initialize();
    } catch (error) {
        console.log(error);
        throw error;
    }
};

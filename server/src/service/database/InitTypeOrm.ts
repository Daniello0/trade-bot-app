import { DataSource } from 'typeorm';
import * as process from 'node:process';
import { User } from './entity/User';
import * as console from 'node:console';

export const DatabaseService = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'tradeBotApp',
    entities: [User],
    synchronize: false,
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

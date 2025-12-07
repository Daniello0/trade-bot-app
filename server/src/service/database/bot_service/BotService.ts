import { DatabaseService } from '../InitTypeOrm';
import { Bots } from '../entity/Bots';
import {
    createSpotGridSettings,
    spotGridSettingsType,
} from './grid_spot/SpotGridSettingsService';
import { SpotGridSettings } from '../entity/grid_spot/SpotGridSettings';
import { FullSpotSettings } from '../entity/full_spot/FullSpotSettings';
import { EntityManager } from 'typeorm';

export type botCreationParams = {
    user_id: string;
    name: string;
    deposit: number;
    bot_type: 'spotGrid' | 'fullSpot';

    spot_grid_settings_data?: spotGridSettingsType;
    full_spot_settings_data?: any;
};

export const createBot = async (botData: botCreationParams): Promise<Bots> => {
    return await DatabaseService.transaction(
        async (transactionalEntityManager: EntityManager): Promise<Bots> => {
            let settingsEntity: SpotGridSettings | FullSpotSettings | null =
                null;

            if (
                botData.bot_type === 'spotGrid' &&
                botData.spot_grid_settings_data
            ) {
                settingsEntity = await createSpotGridSettings(
                    botData.spot_grid_settings_data,
                    transactionalEntityManager
                );
            } else if (
                botData.bot_type === 'fullSpot' &&
                botData.full_spot_settings_data
            ) {
                throw new Error(
                    'Full Spot bot creation is not implemented yet.'
                );
            } else {
                throw new Error('Invalid bot_type or missing settings data.');
            }

            const botRepository =
                transactionalEntityManager.getRepository(Bots);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const newBot: Bots = botRepository.create({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user_id: botData.user_id,
                name: botData.name,
                deposit: botData.deposit,
                bot_type: botData.bot_type,

                spot_grid_settings:
                    botData.bot_type === 'spotGrid' ? settingsEntity : null,
                full_spot_settings: null,
            });

            return await botRepository.save(newBot);
        }
    );
};

export const getBot = async (getBotData: {
    userId: string;
    botId: number;
    botType: string;
}) => {
    return await DatabaseService.manager.findOne(Bots, {
        where: {
            user_id: getBotData.userId,
            id: getBotData.botId,
            bot_type: getBotData.botType,
        },
        relations: {
            spot_grid_settings: {
                grid_settings: true,
                levels_settings: true,
            },
            full_spot_settings: {
                stop_loss_settings: true,
            },
        },
    });
};

export const getAllBots = async (userId: string) => {
    return DatabaseService.manager.find(Bots, {
        where: {
            user_id: userId,
        },
        relations: {
            spot_grid_settings: {
                grid_settings: true,
                levels_settings: true,
            },
            full_spot_settings: {
                stop_loss_settings: true,
            },
        },
    });
};

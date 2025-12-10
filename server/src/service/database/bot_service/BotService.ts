import { DatabaseService } from '../InitTypeOrm';
import { Bots } from '../entity/Bots';
import { createSpotGridSettings } from './grid_spot/SpotGridSettingsService';
import { SpotGridSettings } from '../entity/grid_spot/SpotGridSettings';
import { FullSpotSettings } from '../entity/full_spot/FullSpotSettings';
import { EntityManager } from 'typeorm';
import { CreateBotDto } from '../../../dto/create_dto/create-bot-dto';

/*export const createBotService = async (
    botData: CreateBotDto,
    userId: string
): Promise<Bots> => {
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

            const newBot: Bots = botRepository.create({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user_id: userId,
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
};*/

export const getBotService = async (getBotData: {
    userId: string;
    botId: number;
    botType: string;
}) => {
    return await DatabaseService.manager.findOne(Bots, {
        where: {
            user: { id: getBotData.userId },
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

export const getAllBotsService = async (userId: string) => {
    return DatabaseService.manager.find(Bots, {
        where: {
            user: { id: userId },
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

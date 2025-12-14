import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBotDto } from '../dto/create_dto/create-bot-dto';
import {
    ReadBotDetailsDto,
    ReadBotSummaryDto,
} from '../dto/read_dto/read-bot.dto';
import { DatabaseService } from './database/InitTypeOrm';
import { Bots } from './database/entity/Bots';
import { EntityManager } from 'typeorm';
import { SpotGridSettings } from './database/entity/grid_spot/SpotGridSettings';
import { FullSpotSettings } from './database/entity/full_spot/FullSpotSettings';
import {
    createSpotGridSettings,
    updateSpotGridSettings,
} from './database/bot_service/grid_spot/SpotGridSettingsService';

@Injectable()
export class BotService {
    async getBotSummary(botData: {
        userId: string;
        botId: number;
        botType: string;
    }): Promise<ReadBotSummaryDto | null> {
        const bots = await DatabaseService.manager.findOne(Bots, {
            where: {
                user: { id: botData.userId },
                id: botData.botId,
                bot_type: botData.botType,
            },
        });

        if (!bots) return null;

        return {
            id: bots.id,
            name: bots.name,
            bot_type: bots.bot_type,
        };
    }

    async getBotDetails(botData: {
        userId: string;
        botId: number;
    }): Promise<ReadBotDetailsDto | null> {
        const bots = await DatabaseService.manager.findOne(Bots, {
            where: {
                user: { id: botData.userId },
                id: botData.botId,
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

        if (!bots) return null;

        return {
            id: bots.id,
            name: bots.name,
            deposit: bots.deposit,
            bot_type: bots.bot_type,
            full_spot_settings: null,
            spot_grid_settings: {
                history_length: bots.spot_grid_settings.history_length,
                candle_length: bots.spot_grid_settings.candle_length,
                crypto: bots.spot_grid_settings.crypto,
                stop_loss_type: bots.spot_grid_settings.stop_loss_type,
                update_grid_interval_type:
                    bots.spot_grid_settings.update_grid_interval_type,
                update_grid_interval_time:
                    bots.spot_grid_settings.update_grid_interval_time,
                grid_settings: {
                    type: bots.spot_grid_settings.grid_settings.type,
                    lower_bound_static:
                        bots.spot_grid_settings.grid_settings
                            .lower_bound_static,
                    upper_bound_static:
                        bots.spot_grid_settings.grid_settings
                            .upper_bound_static,
                    lower_bound_dynamic:
                        bots.spot_grid_settings.grid_settings
                            .lower_bound_dynamic,
                    upper_bound_dynamic:
                        bots.spot_grid_settings.grid_settings
                            .upper_bound_dynamic,
                },
                levels_settings: {
                    type: bots.spot_grid_settings.levels_settings.type,
                    count_static:
                        bots.spot_grid_settings.levels_settings.count_static,
                    price_per_bet_static:
                        bots.spot_grid_settings.levels_settings
                            .price_per_bet_static,
                    profit_dynamic:
                        bots.spot_grid_settings.levels_settings.profit_dynamic,
                },
            },
        };
    }

    async createBot(botData: CreateBotDto, userId: string): Promise<void> {
        await DatabaseService.transaction(
            async (
                transactionalEntityManager: EntityManager
            ): Promise<Bots> => {
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
                    throw new Error(
                        'Invalid bot_type or missing settings data.'
                    );
                }

                const botRepository =
                    transactionalEntityManager.getRepository(Bots);

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const newBot: Bots = botRepository.create({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    user: {
                        id: userId,
                    },
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
    }

    async getAllBotsSummary(
        userId: string
    ): Promise<ReadBotSummaryDto[] | undefined> {
        const bots = await DatabaseService.manager.find(Bots, {
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

        return bots.map((bot: Bots) => {
            return {
                id: bot.id,
                name: bot.name,
                bot_type: bot.bot_type,
            };
        });
    }

    async deleteBot(botId: number, userId: string): Promise<void> {
        const botRepository = DatabaseService.getRepository(Bots);

        const botToRemove = await botRepository.findOne({
            where: {
                id: botId,
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

        if (!botToRemove) {
            throw new NotFoundException(
                `Bot with ID "${botId}" not found or you don't have permission to delete it.`
            );
        }

        await botRepository.remove(botToRemove, {
            transaction: true,
        });
    }

    async updateBot(
        botId: number,
        userId: string,
        updateData: CreateBotDto
    ): Promise<void> {
        await DatabaseService.transaction(
            async (transactionalEntityManager) => {
                const botRepository =
                    transactionalEntityManager.getRepository(Bots);

                const botToUpdate = await botRepository.findOne({
                    where: { id: botId, user: { id: userId } },
                    relations: {
                        spot_grid_settings: true,
                        full_spot_settings: true,
                    },
                });

                if (!botToUpdate) {
                    throw new NotFoundException(
                        `Bot with ID "${botId}" not found or permission denied.`
                    );
                }

                const {
                    spot_grid_settings_data,
                    full_spot_settings_data,
                    ...botFields
                } = updateData;

                if (Object.keys(botFields).length > 0) {
                    await botRepository.update(botId, botFields);
                }

                if (spot_grid_settings_data && botToUpdate.spot_grid_settings) {
                    await updateSpotGridSettings(
                        botToUpdate.spot_grid_settings.id,
                        userId,
                        spot_grid_settings_data,
                        transactionalEntityManager
                    );
                }

                if (full_spot_settings_data && botToUpdate.full_spot_settings) {
                    throw new Error(
                        'Full Spot bot update is not implemented yet.'
                    );
                }
            }
        );
    }
}

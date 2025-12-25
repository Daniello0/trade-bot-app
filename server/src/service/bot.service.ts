import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bots } from '../entity/Bots';
import { CreateBotDto } from '../dto/create-bot-dto';
import { ReadBotDetailsDto, ReadBotSummaryDto } from '../dto/read-bot.dto';
import { SpotGridSettingsService } from '../database-service/spot-grid-settings.service';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import { mapBotToReadBotDetailsDto } from '../mapper/bot.mapper';

@Injectable()
export class BotService {
    constructor(
        @InjectRepository(Bots)
        private readonly botRepository: Repository<Bots>,

        private readonly spotGridSettingsService: SpotGridSettingsService
    ) {}

    async create(
        createDto: CreateBotDto,
        userId: string | undefined
    ): Promise<Bots> {
        if (!userId) {
            throw new NotFoundException('User not found.');
        }

        return this.botRepository.manager.transaction(
            async (transactionalEntityManager) => {
                let settingsEntity: SpotGridSettings | undefined = undefined;

                if (
                    createDto.bot_type === 'spotGrid' &&
                    createDto.spot_grid_settings_data
                ) {
                    settingsEntity = await this.spotGridSettingsService.create(
                        createDto.spot_grid_settings_data,
                        transactionalEntityManager
                    );
                }

                const newBot = this.botRepository.create({
                    ...createDto,
                    user: { id: userId },
                    spot_grid_settings: settingsEntity,
                });

                return await transactionalEntityManager.save(newBot);
            }
        );
    }

    async findAllSummaries(
        userId: string | undefined
    ): Promise<ReadBotSummaryDto[]> {
        if (!userId) {
            throw new NotFoundException('User not found.');
        }

        const bots = await this.botRepository.find({
            where: { user: { id: userId } },
        });

        return bots.map((bot) => ({
            id: bot.id,
            name: bot.name,
            bot_type: bot.bot_type,
            deposit: bot.deposit,
        }));
    }

    async findOneDetails(botData: {
        userId: string | undefined;
        botId: number;
    }): Promise<ReadBotDetailsDto | null> {
        const bot = await this.botRepository.findOne({
            where: { id: botData.botId, user: { id: botData.userId } },
            relations: {
                spot_grid_settings: {
                    grid_settings: true,
                    levels_settings: true,
                },
            },
        });

        if (!bot) return null;

        return mapBotToReadBotDetailsDto(bot);
    }

    async update(
        botId: number,
        userId: string | undefined,
        updateData: CreateBotDto
    ): Promise<void> {
        if (!userId) {
            throw new NotFoundException('User not found.');
        }

        await this.botRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const botRepository =
                    transactionalEntityManager.getRepository(Bots);

                const botToUpdate = await botRepository.findOne({
                    where: { id: botId, user: { id: userId } },
                    relations: { spot_grid_settings: true },
                });

                if (!botToUpdate) {
                    throw new NotFoundException(
                        `Bot with ID "${botId}" not found or permission denied.`
                    );
                }

                const { spot_grid_settings_data, ...botFields } = updateData;

                if (Object.keys(botFields).length > 0) {
                    await botRepository.update(botId, botFields);
                }

                if (spot_grid_settings_data && botToUpdate.spot_grid_settings) {
                    await this.spotGridSettingsService.update(
                        botToUpdate.spot_grid_settings.id,
                        userId,
                        spot_grid_settings_data,
                        transactionalEntityManager
                    );
                }
            }
        );
    }

    async remove(botId: number, userId: string | undefined): Promise<void> {
        if (!userId) {
            throw new NotFoundException('User not found.');
        }

        const botToRemove = await this.botRepository.findOne({
            where: { id: botId, user: { id: userId } },
            relations: {
                spot_grid_settings: {
                    grid_settings: true,
                    levels_settings: true,
                },
            },
        });

        if (!botToRemove) {
            throw new NotFoundException(
                `Bot with ID "${botId}" not found or you don't have permission to delete it.`
            );
        }

        await this.botRepository.remove(botToRemove);
    }
}

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
                    createDto.botType === 'spotGrid' &&
                    createDto.spotGridSettingsData
                ) {
                    settingsEntity = await this.spotGridSettingsService.create(
                        createDto.spotGridSettingsData,
                        transactionalEntityManager
                    );
                }

                const newBot = this.botRepository.create({
                    ...createDto,
                    user: { id: userId },
                    spotGridSettings: settingsEntity,
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
            botType: bot.botType,
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
                spotGridSettings: {
                    gridSettings: true,
                    levelsSettings: true,
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
                    relations: { spotGridSettings: true },
                });

                if (!botToUpdate) {
                    throw new NotFoundException(
                        `Bot with ID "${botId}" not found or permission denied.`
                    );
                }

                const { spotGridSettingsData, ...botFields } = updateData;

                if (Object.keys(botFields).length > 0) {
                    await botRepository.update(botId, botFields);
                }

                if (spotGridSettingsData && botToUpdate.spotGridSettings) {
                    await this.spotGridSettingsService.update(
                        botToUpdate.spotGridSettings.id,
                        userId,
                        spotGridSettingsData,
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
                spotGridSettings: {
                    gridSettings: true,
                    levelsSettings: true,
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

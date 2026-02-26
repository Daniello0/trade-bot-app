import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Bots } from '../../entity/Bots';
import { CreateBotDto } from '../../dto/create-bot-dto';
import { ReadBotDetailsDto, ReadBotSummaryDto } from '../../dto/read-bot.dto';
import { SpotGridSettingsService } from './spot-grid-settings.service';
import { SpotGridSettings } from '../../entity/SpotGridSettings';
import {
    mapBotToReadBotDetailsDto,
    mapBotToReadBotSummaryDto,
} from '../../mapper/bot.mapper';

@Injectable()
export class BotSettingsService {
    constructor(
        @InjectRepository(Bots)
        private readonly botRepository: Repository<Bots>,

        private readonly spotGridSettingsService: SpotGridSettingsService
    ) {}

    async create(
        createDto: CreateBotDto,
        userEmail: string | undefined
    ): Promise<Bots> {
        const email: string = this.getValidUserId(userEmail);

        try {
            return await this.botRepository.manager.transaction(
                async (manager: EntityManager) => {
                    await this.ifBotExistsThrow(manager, createDto.name, email);

                    const settings: SpotGridSettings | undefined =
                        await this.createSettingsIfNeed(createDto, manager);

                    const newBot: Bots = this.botRepository.create({
                        ...createDto,
                        user: { email },
                        spotGridSettings: settings,
                    });

                    return await manager.save(newBot);
                }
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                `Ошибка при создании бота: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findAllSummaries(
        userId: string | undefined
    ): Promise<(ReadBotSummaryDto | null)[]> {
        const bots: Bots[] = await this.botRepository.find({
            where: { user: { id: userId } },
        });
        return bots.map((bot: Bots) => mapBotToReadBotSummaryDto(bot));
    }

    async findOneDetails(botData: {
        userId: string | undefined;
        botId: number;
    }): Promise<ReadBotDetailsDto | null> {
        const bot: Bots | null = await this.botRepository.findOne({
            where: { id: botData.botId, user: { id: botData.userId } },
            relations: {
                spotGridSettings: {
                    gridSettings: true,
                    levelsSettings: true,
                },
            },
        });
        return mapBotToReadBotDetailsDto(bot);
    }

    async findOneSummary(
        userId: string | undefined,
        botId: number
    ): Promise<ReadBotSummaryDto | null> {
        const bot = await this.botRepository.findOne({
            where: { id: botId, user: { id: userId } },
        });

        if (!bot) return null;

        return mapBotToReadBotSummaryDto(bot);
    }

    async update(
        botId: number,
        userId: string | undefined,
        updateData: CreateBotDto
    ): Promise<void> {
        const validUserId: string = this.getValidUserId(userId);

        await this.botRepository.manager.transaction(
            async (manager: EntityManager) => {
                const bot: Bots = await this.findBotOrThrow(
                    botId,
                    validUserId,
                    { spotGridSettings: true },
                    manager
                );

                if (updateData.name !== bot.name) {
                    const isTaken: boolean = await this.isBotNameTakenByAnother(
                        manager,
                        updateData.name,
                        validUserId,
                        botId
                    );

                    if (isTaken) {
                        throw new HttpException(
                            'Бот с таким именем уже существует',
                            HttpStatus.CONFLICT
                        );
                    }
                }

                const { spotGridSettingsData, ...botFields } = updateData;

                if (Object.keys(botFields).length > 0) {
                    await manager.update(Bots, botId, botFields);
                }

                if (spotGridSettingsData && bot.spotGridSettings) {
                    await this.spotGridSettingsService.update(
                        bot.spotGridSettings.id,
                        validUserId,
                        spotGridSettingsData,
                        manager
                    );
                }
            }
        );
    }

    async remove(botId: number, userId: string | undefined): Promise<void> {
        const validUserId: string = this.getValidUserId(userId);

        const bot: Bots = await this.findBotOrThrow(botId, validUserId, {
            spotGridSettings: { gridSettings: true, levelsSettings: true },
        });
        await this.botRepository.remove(bot);
    }

    async switchBotStatus(
        botId: number,
        userId: string | undefined
    ): Promise<void> {
        const validUserId: string = this.getValidUserId(userId);
        const bot: Bots = await this.findBotOrThrow(botId, validUserId);
        bot.status = bot.status === 'running' ? 'stopped' : 'running';
        await this.botRepository.save(bot);
    }

    private async isBotExists(
        manager: EntityManager,
        name: string,
        userEmail?: string
    ): Promise<boolean> {
        const existing: Bots | null = await manager.findOne(Bots, {
            where: {
                name: name,
                user: { email: userEmail },
            },
        });

        return !!existing;
    }

    private async isBotNameTakenByAnother(
        manager: EntityManager,
        name: string,
        userId: string,
        botId: number
    ): Promise<boolean> {
        const existing: Bots | null = await manager.findOne(Bots, {
            where: {
                name,
                user: { id: userId },
            },
        });

        return !!existing && existing.id !== botId;
    }

    private async ifBotExistsThrow(
        manager: EntityManager,
        name: string,
        userEmail?: string
    ): Promise<void> {
        const isExisting: boolean = await this.isBotExists(
            manager,
            name,
            userEmail
        );

        if (isExisting) {
            throw new HttpException(
                'Бот с таким именем уже существует',
                HttpStatus.CONFLICT
            );
        }
    }

    private async findBotOrThrow(
        botId: number,
        userId: string,
        relations = {},
        manager?: EntityManager
    ): Promise<Bots> {
        const repo: Repository<Bots> = manager
            ? manager.getRepository(Bots)
            : this.botRepository;
        const bot: Bots | null = await repo.findOne({
            where: { id: botId, user: { id: userId } },
            relations,
        });

        if (!bot) {
            throw new NotFoundException(
                `Bot with ID "${botId}" not found or access denied.`
            );
        }
        return bot;
    }

    private async createSettingsIfNeed(
        dto: CreateBotDto,
        manager: EntityManager
    ): Promise<SpotGridSettings | undefined> {
        if (dto.botType === 'spotGrid' && dto.spotGridSettingsData) {
            return await this.spotGridSettingsService.create(
                dto.spotGridSettingsData,
                manager
            );
        }
        return undefined;
    }

    private getValidUserId(userId: string | undefined): string {
        if (!userId) {
            throw new NotFoundException('User not found.');
        }
        return userId;
    }
}

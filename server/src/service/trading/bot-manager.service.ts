import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { BotSettingsService } from '../database/bot-settings.service';
import { ReadBotSummaryDto } from '../../dto/read-bot.dto';
import { TradeLoopService } from './trade-loop.service';

@Injectable()
export class BotManagerService implements OnModuleDestroy {
    private readonly logger = new Logger(BotManagerService.name);

    private activeBots = new Map<
        string,
        { controller: AbortController; userId: string }
    >();

    constructor(
        private readonly botService: BotSettingsService,
        private readonly tradeLoopService: TradeLoopService
    ) {}

    async startBot(botId: number, userId: string | undefined) {
        const stringBotId: string = botId.toString();

        if (!userId) return;
        if (this.activeBots.has(stringBotId)) return;

        await this.botService.switchBotStatus(Number(botId), userId);

        const controller = new AbortController();
        this.activeBots.set(stringBotId, { controller, userId });

        this.runBotLoop(botId, userId, controller.signal).catch(async (err) => {
            this.logger.error(`Bot ${botId} crashed:`, err);
            await this.stopBot(botId, userId);
        });

        this.logger.log(`Bot ${botId} started for user ${userId}`);
    }

    async stopBot(botId: number, userId: string | undefined) {
        const stringBotId: string = botId.toString();
        const session = this.activeBots.get(stringBotId);

        if (session) {
            session.controller.abort();
            this.activeBots.delete(stringBotId);

            await this.botService.switchBotStatus(botId, userId);

            this.logger.log(`Bot ${botId} stopped and status updated in DB`);
        }
    }

    async toggleBot(userId: string | undefined, botId: number) {
        const bot: ReadBotSummaryDto | null =
            await this.botService.findOneSummary(userId, botId);

        if (!bot) {
            throw new Error(`Bot with ID "${botId}" not found.`);
        }

        if (bot.status === 'running') {
            return this.stopBot(botId, userId);
        } else if (bot.status === 'stopped') {
            return this.startBot(botId, userId);
        }
    }

    private async runBotLoop(
        botId: number,
        userId: string,
        signal: AbortSignal
    ) {
        this.logger.log(`Loop started for bot ${botId}`);

        await this.tradeLoopService.start(userId, botId, signal);

        this.logger.log(`Loop finished for bot ${botId}`);
    }

    async onModuleDestroy() {
        for (const [botId, session] of this.activeBots.entries()) {
            await this.stopBot(Number(botId), session.userId);
        }
    }
}

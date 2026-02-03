import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { BotGateway } from '../../gateway/bot.gateway';
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
        private readonly botGateway: BotGateway,
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

    private sleep(ms: number, signal: AbortSignal) {
        return new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms);
            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                resolve(null);
            });
        });
    }

    async onModuleDestroy() {
        for (const [botId, session] of this.activeBots.entries()) {
            await this.stopBot(Number(botId), session.userId);
        }
    }

    private async testWork(
        userId: string | undefined,
        botId: string,
        signal: AbortSignal
    ) {
        try {
            const price = 60000 + Math.random() * 1000;

            const payload = {
                userId,
                botId,
                price: price.toFixed(2),
                message: `Check grid status... OK`,
                timestamp: new Date().toISOString(),
            };

            this.botGateway.server.to(`bot_${botId}`).emit('botLog', payload);

            this.botGateway.server
                .to('all_bots_logs')
                .emit('globalLog', payload);

            await this.sleep(1000, signal);
        } catch (err) {
            if (signal.aborted) return;
            this.logger.error(`Error in bot ${botId} loop: ${err}`);
            await this.sleep(10000, signal);
        }
    }
}

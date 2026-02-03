import { Injectable, Logger } from '@nestjs/common';
import { BybitService } from './bybit.service';
import { WebsocketClient, WsTopicRequest } from 'bybit-api';
import { UserService } from '../user/user.service';
import { BotSettingsService } from '../database/bot-settings.service';
import { Bot } from './bot';

@Injectable()
export class TradeLoopService {
    private readonly logger = new Logger(TradeLoopService.name);
    private lastCalledPeriod: number | null = null;

    constructor(
        private readonly bybitService: BybitService,
        private readonly userService: UserService,
        private readonly botSettingsService: BotSettingsService
    ) {}

    async start(
        userId: string | undefined,
        botId: number,
        signal: AbortSignal
    ) {
        const user = await this.userService.getApiKeys(userId);

        const ws = new WebsocketClient({
            key: user.apiKey,
            secret: user.apiSecret,
            demoTrading: true,
        });

        const botSettings = await this.botSettingsService.findOneDetails({
            userId: userId,
            botId: botId,
        });

        if (!botSettings) {
            throw new Error(`Bot with ID "${botId}" not found.`);
        }

        const bot: Bot = Bot.setupBot(botSettings, this.bybitService);

        const symbol: string = bot.symbol;

        signal.addEventListener('abort', () => {
            this.logger.log(
                `Closing WebSocket for bot ${symbol} due to abort signal`
            );
            ws.closeAll();
        });

        void ws.subscribeV5(`kline.1.${symbol}`, 'spot');

        // Инициализация
        const seedPrice: number = await this.bybitService.getLatestPrice();
        this.logger.log(`Placing initial grid using seed price: ${seedPrice}`);
        bot.placeInitialGridOrders(seedPrice);

        const OHLC = await this.bybitService.getLastNOhlc(bot.candleLength);
        this.updateGridBounds(bot, this.bybitService, OHLC.closes);

        ws.on('update', (data: WsTopicRequest) => {
            void (async () => {
                if (signal.aborted) return;

                try {
                    if (data.topic?.startsWith('kline')) return;

                    const lastPrice = await this.bybitService.getLatestPrice();
                    const openSellOrders =
                        await this.bybitService.getOpenSellOrders();
                    const openBuyOrders =
                        await this.bybitService.getOpenBuyOrders();
                    const currentOHLC = await this.bybitService.getLastNOhlc(
                        bot.candleLength
                    );

                    const now = new Date();
                    const candleLen = Number(bot.candleLength) || 5;
                    const currentPeriod = Math.floor(
                        now.getMinutes() / candleLen
                    );

                    if (
                        currentPeriod !== this.lastCalledPeriod &&
                        now.getSeconds() < 5
                    ) {
                        this.lastCalledPeriod = currentPeriod;
                        this.updateGridBounds(
                            bot,
                            this.bybitService,
                            currentOHLC.closes
                        );

                        // ИСПРАВЛЕНИЕ: Последовательно ожидаем промисы
                        for (const order of openBuyOrders) {
                            await this.bybitService.cancelOrder(order);
                        }
                    }

                    if (openSellOrders.length >= bot.numberOfGrids) {
                        return;
                    }

                    await bot.botMakeDecision({
                        currentPrice: lastPrice,
                    });
                } catch (err) {
                    this.logger.error('WS update handler error:', err);
                }
            })();
        });

        ws.on('exception', (err) => this.logger.error('WS Exception', err));
    }

    private updateGridBounds(
        bot: Bot,
        bybitService: BybitService,
        historicalData: number[]
    ) {
        const quartiles = bybitService.calculateQuartiles(historicalData);
        if (!quartiles) return;

        const lower = quartiles.Q10;
        const upper = quartiles.Q90;

        bot.updateGridBounds(lower, upper);
    }
}

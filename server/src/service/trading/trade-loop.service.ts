import { Injectable, Logger } from '@nestjs/common';
import { WebsocketClient, WsTopicRequest } from 'bybit-api';
import { UserKeysService } from '../user/user-keys.service';
import { BotSettingsService } from '../database/bot-settings.service';
import { Bot } from './bot';
import { Bybit } from './bybit';
import { BotGateway } from '../../gateway/bot.gateway';
import { LogDto } from '../../dto/log.dto';

@Injectable()
export class TradeLoopService {
    private readonly logger = new Logger(TradeLoopService.name);
    private lastCalledPeriod: number | null = null;

    constructor(
        private readonly userService: UserKeysService,
        private readonly botSettingsService: BotSettingsService,
        private readonly botGateway: BotGateway
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

        const symbol: string =
            botSettings.spotGridSettings?.crypto || 'BTCUSDT';

        const emitLog = (payload: LogDto | string, price?: number) => {
            let logObject: LogDto;

            const cleanSymbol = symbol.replace('USDT', '');

            if (typeof payload === 'object' && payload !== null) {
                logObject = {
                    botId: botId,
                    timestamp: payload.timestamp || new Date().toISOString(),
                    message: payload.message || '',
                    price: payload.price ? Number(payload.price) : price,
                    symbol: cleanSymbol,
                };
            } else {
                logObject = {
                    botId: botId,
                    timestamp: new Date().toISOString(),
                    message: String(payload),
                    price: bot.lastPrice,
                    symbol: cleanSymbol,
                };
            }

            this.botGateway.server.to(`bot_${botId}`).emit('botLog', logObject);
        };

        const bybit = new Bybit(
            symbol,
            user.apiKey,
            user.apiSecret,
            true,
            emitLog
        );
        await bybit.init();

        /*const scales = await bybit.getCryptoScale();

        if (!scales?.priceScale || !scales.qtyScale) {
            throw new Error('qtyScale or priceScale is not defined');
        }

        bybit.priceScale = scales?.priceScale;
        bybit.qtyScale = scales?.qtyScale;*/

        const bot = new Bot(botSettings, bybit, emitLog);
        await bot.init(bybit);

        signal.addEventListener('abort', () => {
            this.logger.log(
                `Closing WebSocket for bot ${symbol} due to abort signal`
            );
            ws.closeAll();
        });

        void ws.subscribeV5(`kline.1.${symbol}USDT`, 'spot');

        const seedPrice: number = await bybit.getLatestPrice();
        this.logger.log(`Placing initial grid using seed price: ${seedPrice}`);
        bot.placeInitialGridOrders(seedPrice);

        const OHLC = await bybit.getLastNOhlc(bot.candleLength);
        this.updateGridBounds(bot, bybit, OHLC.closes);

        ws.on('update', (data: WsTopicRequest) => {
            void (async () => {
                if (signal.aborted) return;

                try {
                    if (!data.topic?.startsWith('kline')) return;
                    const lastPrice = await bybit.getLatestPrice();
                    const openSellOrders = await bybit.getOpenSellOrders();
                    const openBuyOrders = await bybit.getOpenBuyOrders();
                    const OHLC = await bybit.getLastNOhlc(bot.candleLength);
                    const historicalData = OHLC.closes;

                    emitLog('\n');
                    emitLog(`Open sell orders: ${openSellOrders.length}`);
                    emitLog(`Open buy orders: ${openBuyOrders.length}`);
                    emitLog(
                        `Orders in memory to sell: ${bot.ordersToSell.length}`
                    );

                    const now = new Date();
                    const currentPeriod = Math.floor(
                        now.getMinutes() / Number(bot.candleLength)
                    );
                    if (
                        currentPeriod !== this.lastCalledPeriod &&
                        now.getSeconds() < 3
                    ) {
                        this.lastCalledPeriod = currentPeriod;

                        emitLog('ЗАКРЫТИЕ СВЕЧИ...');

                        this.updateGridBounds(bot, bybit, historicalData);

                        if (openBuyOrders.length > 0) {
                            emitLog('Закрываю застрявшие buy-ордеры');
                            for (const order of openBuyOrders) {
                                await bybit.cancelOrder(order);
                                bot.ordersToSell = [];
                            }
                        }
                    } else {
                        emitLog(`Lower = ${bot.lowerPriceBound}`);
                        emitLog(`Upper = ${bot.upperPriceBound}`);
                        emitLog(`Number of grids = ${bot.numberOfGrids}`);
                        // refactor: fix ESLint
                        emitLog(
                            `Grid state: ${bot.gridLevels.map((order) => ' ' + order.toFixed(4))}, step=${bot.gridInterval.toFixed(6)}`
                        );
                    }

                    if (openSellOrders.length >= bot.numberOfGrids) {
                        emitLog(
                            `Максимум sell-ордеров (${bot.numberOfGrids}) достигнут — покупка невозможна`
                        );
                        return;
                    }

                    await bot.botMakeDecision({ currentPrice: lastPrice });
                } catch (err) {
                    this.logger.error('WS update handler error:', err);
                }
            })();
        });

        ws.on('exception', (err) => this.logger.error('WS Exception', err));

        await new Promise((resolve) => {
            signal.addEventListener('abort', () => {
                ws.closeAll();
                resolve(null);
            });
        });
    }

    private updateGridBounds(
        bot: Bot,
        bybitService: Bybit,
        historicalData: number[]
    ) {
        const quantiles = bybitService.calculateQuartiles(historicalData);
        if (!quantiles) return;

        bot.applyQuantiles(quantiles);

        bot.updateGridBounds(bot.lowerPriceBound, bot.upperPriceBound);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { AccountOrderV5, WebsocketClient, WsTopicRequest } from 'bybit-api';
import { UserKeysService } from '../user/user-keys.service';
import { BotSettingsService } from '../database/bot-settings.service';
import { Bot } from './bot';
import { Bybit } from './bybit';
import { BotGateway } from '../../gateway/bot.gateway';
import { LogDto } from '../../dto/log.dto';
import {
    CalculatedQuantiles,
    calculateQuartiles,
} from '../../utils/math.utils';
import { RuntimeStateDto } from '../../dto/runtime-state.dto';

type EmitLogFn = (payload: any, price?: number) => void;

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
        const botSettings = await this.botSettingsService.findOneDetails({
            userId,
            botId,
        });
        if (!botSettings) throw new Error(`Bot with ID "${botId}" not found.`);

        const symbol: string =
            botSettings.spotGridSettings?.crypto || 'BTCUSDT';

        const runtimeState: RuntimeStateDto = new RuntimeStateDto();

        const botRef = { lastPrice: 0 };
        const emitLog = (payload: LogDto, price?: number) =>
            this.sendBotLog(botId, symbol, payload, price || botRef.lastPrice);

        const bybit = new Bybit(
            symbol,
            user.apiKey,
            user.apiSecret,
            true,
            emitLog
        );
        await bybit.init();

        const bot = new Bot(botSettings, bybit, emitLog);
        await bot.init(bybit);

        botRef.lastPrice = bot.lastPrice;

        const ws = new WebsocketClient({
            key: user.apiKey,
            secret: user.apiSecret,
            demoTrading: true,
        });
        this.setupWsCleanup(ws, signal, symbol);

        await this.initialSync(bot, bybit);

        ws.on('update', (data: WsTopicRequest) => {
            void this.handleWsUpdate(data, bot, bybit, signal, emitLog);
            this.botGateway.server.to(`bot_${botId}`).emit('botStatus', {})
        });

        ws.on('exception', (err) => this.logger.error('WS Exception', err));
        void ws.subscribeV5(`kline.1.${symbol}USDT`, 'spot');

        await new Promise((resolve) => {
            signal.addEventListener('abort', () => resolve(null));
        });
    }

    private async handleWsUpdate(
        data: WsTopicRequest,
        bot: Bot,
        bybit: Bybit,
        signal: AbortSignal,
        emitLog: EmitLogFn
    ) {
        if (signal.aborted || !data.topic?.startsWith('kline')) return;

        try {
            const lastPrice = await bybit.getLatestPrice();
            const openSellOrders = await bybit.getOpenOrders('Sell');
            const openBuyOrders = await bybit.getOpenOrders('Buy');
            const OHLC = await bybit.getLastNOhlc(bot.candleLength);

            this.logTickStatus(
                emitLog,
                bot,
                openSellOrders.length,
                openBuyOrders.length
            );

            await this.processCandleChange(
                bot,
                bybit,
                OHLC.closes,
                openBuyOrders,
                emitLog
            );

            if (openSellOrders.length < bot.numberOfGrids) {
                await bot.botMakeDecision({ currentPrice: lastPrice });
            } else {
                emitLog(`Максимум sell-ордеров достигнут`);
            }
        } catch (err) {
            this.logger.error('WS update handler error:', err);
        }
    }

    private async processCandleChange(
        bot: Bot,
        bybit: Bybit,
        historicalData: number[],
        openBuyOrders: AccountOrderV5[],
        emitLog: EmitLogFn
    ) {
        const now = new Date();
        const currentPeriod = Math.floor(
            now.getMinutes() / Number(bot.candleLength)
        );

        if (currentPeriod !== this.lastCalledPeriod && now.getSeconds() < 3) {
            this.lastCalledPeriod = currentPeriod;
            emitLog('ЗАКРЫТИЕ СВЕЧИ...');
            this.updateGridBounds(bot, historicalData);

            if (openBuyOrders.length > 0) {
                emitLog('Очистка застрявших BUY ордеров');
                for (const order of openBuyOrders)
                    await bybit.cancelOrder(order.orderId);
                bot.ordersToSell = [];
            }
        }
    }

    private updateGridBounds(bot: Bot, historicalData: number[]) {
        const quantiles: CalculatedQuantiles | null =
            calculateQuartiles(historicalData);
        if (!quantiles) return;

        bot.applyQuantiles(quantiles);

        bot.updateGridBounds(bot.lowerPriceBound, bot.upperPriceBound);
    }

    private sendBotLog(
        botId: number,
        symbol: string,
        payload: LogDto,
        currentPrice?: number
    ) {
        const isObj: boolean = typeof payload === 'object' && payload !== null;

        const logObject: LogDto = {
            botId: botId,
            timestamp: isObj
                ? payload.timestamp || new Date().toISOString()
                : new Date().toISOString(),
            message: isObj ? payload.message || '' : String(payload),
            price: isObj ? Number(payload.price) || currentPrice : currentPrice,
            symbol: symbol.replace('USDT', ''),
        };

        this.botGateway.server.to(`bot_${botId}`).emit('botLog', logObject);
    }

    private async initialSync(bot: Bot, bybit: Bybit) {
        const seedPrice = await bybit.getLatestPrice();
        bot.placeInitialGridOrders(seedPrice);
        const OHLC = await bybit.getLastNOhlc(bot.candleLength);
        this.updateGridBounds(bot, OHLC.closes);
    }

    private setupWsCleanup(
        ws: WebsocketClient,
        signal: AbortSignal,
        symbol: string
    ) {
        signal.addEventListener('abort', () => {
            this.logger.log(`Closing WS for ${symbol}`);
            ws.closeAll();
        });
    }

    private logTickStatus(
        emitLog: EmitLogFn,
        bot: Bot,
        sells: number,
        buys: number
    ) {
        emitLog(
            `--- TICK | Sells: ${sells} | Buys: ${buys} | Queue: ${bot.ordersToSell.length} ---`
        );
    }
}

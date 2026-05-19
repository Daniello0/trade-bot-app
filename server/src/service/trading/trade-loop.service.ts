import { Injectable, Logger } from '@nestjs/common';
import { AccountOrderV5, WebsocketClient, WsTopicRequest } from 'bybit-api';
import { UserKeysService } from '../user/user-keys.service';
import { BotSettingsService } from '../database/bot-settings.service';
import { Bot } from './bot';
import { Bybit } from './bybit';
import { BotGateway } from '../../gateway/bot.gateway';
import {
    CalculatedQuantiles,
    calculateQuartiles,
} from '../../utils/math.utils';
import { RuntimeStateDto } from '../../dto/runtime-state.dto';

@Injectable()
export class TradeLoopService {
    private readonly logger = new Logger(TradeLoopService.name);
    // SMELL: OOP – Temporary Field
    private lastCalledPeriod: number | null = null;

    constructor(
        private readonly userService: UserKeysService,
        private readonly botSettingsService: BotSettingsService,
        private readonly botGateway: BotGateway
    ) {}

    // SMELL: Bloater – Long Method (typical "script in a method", mixed abstraction levels)
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

        const botRef = { lastPrice: 0 };
        const runtimeState: RuntimeStateDto = new RuntimeStateDto();

        // SMELL: Bloaters – Long Parameter List
        const bybit = new Bybit(
            symbol,
            // SMELL: Bloaters – Data Clumps
            user.apiKey,
            user.apiSecret,
            true,
            runtimeState
        );
        await bybit.init();

        const bot = new Bot(botSettings, bybit, runtimeState);
        await bot.init(bybit);

        botRef.lastPrice = bot.lastPrice;

        const ws = new WebsocketClient({
            // SMELL: Bloaters – Data Clumps
            key: user.apiKey,
            secret: user.apiSecret,
            
            demoTrading: true,
        });
        this.setupWsCleanup(ws, signal, symbol);

        await this.initialSync(bot, bybit);

        ws.on('update', (data: WsTopicRequest) => {
            void this.handleWsUpdate(data, bot, bybit, signal, runtimeState);
            this.sendBotState(botId, runtimeState);
            // SMELL: OOP – Temporary Field
            runtimeState.messages = [];
        });

        ws.on('exception', (err) => this.logger.error('WS Exception', err));
        void ws.subscribeV5(`kline.1.${symbol}USDT`, 'spot');

        await new Promise((resolve) => {
            signal.addEventListener('abort', () => resolve(null));
        });
    }

    // SMELL: Bloaters – Long Parameter List
    private async handleWsUpdate(
        data: WsTopicRequest,
        bot: Bot,
        bybit: Bybit,
        signal: AbortSignal,
        runtimeState: RuntimeStateDto
    ) {
        if (signal.aborted || !data.topic?.startsWith('kline')) return;

        try {
            const lastPrice: number = await bybit.getLatestPrice();
            const openSellOrders: AccountOrderV5[] =
                await bybit.getOpenOrders('Sell');
            const openBuyOrders: AccountOrderV5[] =
                await bybit.getOpenOrders('Buy');
            const OHLC = await bybit.getLastNOhlc(bot.candleLength);

            await this.processCandleChange(
                bot,
                bybit,
                OHLC.closes,
                openBuyOrders,
                runtimeState
            );

            if (openSellOrders.length < bot.numberOfGrids) {
                await bot.botMakeDecision({ currentPrice: lastPrice });
            } else {
                runtimeState.messages?.push('Максимум sell-ордеров достигнут');
            }
        } catch (err) {
            this.logger.error('WS update handler error:', err);
        }
    }

    // SMELL: Bloaters – Long Parameter List
    private async processCandleChange(
        bot: Bot,
        bybit: Bybit,
        historicalData: number[],
        openBuyOrders: AccountOrderV5[],
        runtimeState: RuntimeStateDto
    ) {
        const now = new Date();

        // SMELL: Bloaters – Primitive Obsession (candleLength = API interval и «минуты» в одном примитиве)
        const currentPeriod = Math.floor(
            now.getMinutes() / Number(bot.candleLength)
        );

        // SMELL: OOP – Temporary Field
        if (currentPeriod !== this.lastCalledPeriod && now.getSeconds() < 3) {
            this.lastCalledPeriod = currentPeriod;
            runtimeState.messages?.push('Закрытие свечи...');
            this.updateGridBounds(bot, historicalData);

            if (openBuyOrders.length > 0) {
                runtimeState.messages?.push('Очистка застрявших BUY ордеров.');
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

    private sendBotState(botId: number, runtimeState: RuntimeStateDto) {
        this.botGateway.server
            .to(`bot_${botId}`)
            .emit('botState', runtimeState);
    }

    private async initialSync(bot: Bot, bybit: Bybit) {
        const seedPrice: number = await bybit.getLatestPrice();
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
}

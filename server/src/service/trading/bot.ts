import { ReadBotDetailsDto } from '../../dto/read-bot.dto';
import { Logger } from '@nestjs/common';
import { ReadSpotGridSettingsDto } from '../../dto/read-spot-grid-settings.dto';
import { Bybit } from './bybit';

interface Order {
    price: number;
    qty: number;
}

export class Bot {
    private readonly logger: Logger = new Logger(Bot.name);

    private spotGridSettings: ReadSpotGridSettingsDto;
    public symbol: string;
    private maxDeposit: number;
    public candleLength: string;
    public numberOfGrids: number;
    gridInterval: number;
    public gridLevels: number[];
    public ordersToSell: Order[] = [];
    private lastPrice: number;
    public upperPriceBound: number;
    public lowerPriceBound: number;
    private amountPerOrderUsd: number;
    private lowerQuantile: string;
    private upperQuantile: string;

    constructor(
        private readonly botSettings: ReadBotDetailsDto,
        private readonly bybit: Bybit,
        private onLog?: (payload: any) => void
    ) {
        if (!botSettings.spotGridSettings) {
            this.sendLog('No spot grid settings found!');
            return;
        }

        this.amountPerOrderUsd =
            botSettings.spotGridSettings.levelsSettings.pricePerBetStatic;

        this.spotGridSettings = botSettings.spotGridSettings;
        this.symbol = this.spotGridSettings.crypto || 'BTCUSDT';
        this.maxDeposit = botSettings.deposit;
        this.candleLength = botSettings.spotGridSettings.candleLength;
        this.numberOfGrids = this.spotGridSettings.levelsSettings.countStatic;

        this.lowerQuantile =
            this.spotGridSettings.gridSettings.lowerBoundDynamic;
        this.upperQuantile =
            this.spotGridSettings.gridSettings.upperBoundDynamic;
    }

    public static async setupBot(
        botSettings: ReadBotDetailsDto,
        bybitService: Bybit,
        onLog?: (payload: any) => void
    ) {
        const bot = new Bot(botSettings, bybitService, onLog);

        const historicalData = await bybitService.getLastNOhlc(
            bot.candleLength
        );

        const quantiles = bybitService.calculateQuartiles(
            historicalData.closes
        );

        if (!quantiles) {
            throw new Error('No historical data found!');
        }

        if (bot.upperQuantile == '90%') {
            bot.upperPriceBound = quantiles.Q90;
        } else {
            bot.upperPriceBound = quantiles.max;
        }

        if (bot.lowerQuantile == '10%') {
            bot.lowerPriceBound = quantiles.Q10;
        } else {
            bot.lowerPriceBound = quantiles.min;
        }

        bot.updateGridBounds(bot.lowerPriceBound, bot.upperPriceBound);

        return bot;
    }

    private sendLog(message: string, price?: number) {
        this.logger.log(message);
        if (this.onLog) {
            this.onLog({
                botId: this.botSettings.id,
                timestamp: new Date().toISOString(),
                message,
                price: price?.toFixed(4) || '---',
            });
        }
    }

    placeInitialGridOrders(seedPrice: number) {
        this.gridLevels = [];
        const lower = Number(
            this.spotGridSettings.gridSettings.lowerBoundDynamic
        );

        for (let i = 0; i < this.numberOfGrids; i++) {
            const level = lower + i * this.gridInterval;
            this.gridLevels.push(level);
        }
        this.lastPrice = seedPrice;

        this.sendLog(`Initial grid created. Seed price: ${seedPrice}`);
    }

    async botMakeDecision({ currentPrice }: { currentPrice: number }) {
        const prev = this.lastPrice;
        this.lastPrice = currentPrice;

        for (const order of [...this.ordersToSell]) {
            const sellPrice = +(order.price + this.gridInterval);
            const sellRet = await this.bybit.placeOrder(
                'Sell',
                order.qty,
                sellPrice
            );

            if (sellRet === 0) {
                this.sendLog(
                    `SELL выставлен: ${order.qty.toFixed(2)} @${sellPrice.toFixed(4)}`
                );
                this.ordersToSell = this.ordersToSell.filter(
                    (o) => o !== order
                );
            }
        }

        if (prev === null) return;

        const openSellOrders = await this.bybit.getOpenSellOrders();
        for (const order of openSellOrders) {
            if (Number(order.price) > this.upperPriceBound) {
                await this.bybit.stopLossSell(order, this.upperPriceBound);
            }
        }

        if (
            currentPrice < this.lowerPriceBound ||
            currentPrice > this.upperPriceBound
        ) {
            return;
        }

        for (const level of this.gridLevels) {
            const crossDown = prev >= level && currentPrice <= level;
            const crossUp = prev <= level && currentPrice >= level;

            if (!crossDown && !crossUp) continue;

            const qty = this.amountPerOrderUsd / currentPrice;

            try {
                const allOpenOrders = await this.bybit.getOpenSellOrders();
                const tooClose = allOpenOrders.some(
                    (o) =>
                        Math.abs(Number(o.price) - currentPrice) <
                        this.gridInterval * 0.8
                );

                if (tooClose) continue;

                const buyRet = await this.bybit.placeOrder(
                    'Buy',
                    qty,
                    currentPrice
                );
                if (buyRet === 0) {
                    this.ordersToSell.push({ price: currentPrice, qty: qty });
                }
            } catch (err) {
                this.sendLog(`Ошибка в цикле принятия решений: ${err}`);
            }
        }
    }

    updateGridBounds(newLower: number, newUpper: number) {
        this.lowerPriceBound = newLower;
        this.upperPriceBound = newUpper;
        this.gridInterval = (newUpper - newLower) / this.numberOfGrids;

        this.gridLevels = [];
        for (let i = 0; i < this.numberOfGrids; i++) {
            this.gridLevels.push(this.lowerPriceBound + i * this.gridInterval);
        }
    }
}

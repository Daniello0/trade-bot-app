import { ReadBotDetailsDto } from '../../dto/read-bot.dto';
import { Logger } from '@nestjs/common';
import { ReadSpotGridSettingsDto } from '../../dto/read-spot-grid-settings.dto';
import { Bybit } from './bybit';
import { AccountOrderV5 } from 'bybit-api';

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
    public lastPrice: number;
    public upperPriceBound: number;
    public lowerPriceBound: number;
    private readonly amountPerOrderUsd: number;
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

    private sendLog(message: string) {
        this.logger.log(message);
        if (this.onLog) {
            this.onLog({
                botId: this.botSettings.id,
                timestamp: new Date().toISOString(),
                message: message,
                price: this.lastPrice,
                symbol: this.symbol,
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
            } else {
                this.sendLog(`$Sell order не принят. Код: ${sellRet}`);
            }
        }

        if (prev === null) {
            this.sendLog('Первый тик — сетка создана, ожидаю следующего тика.');
            return;
        }

        const openSellOrders = await this.bybit.getOpenSellOrders();
        for (const order of openSellOrders) {
            if (Number(order.price) > this.upperPriceBound) {
                this.sendLog(
                    'Производится стоп-лосс: ордера перемещаются к сетке'
                );
                await this.bybit.stopLossSell(order, this.upperPriceBound);
            }
        }

        if (
            currentPrice < this.lowerPriceBound ||
            currentPrice > this.upperPriceBound
        ) {
            this.sendLog(
                `Price ${currentPrice.toFixed(6)}
                 вне грида [${this.lowerPriceBound.toFixed(6)},
                  ${this.upperPriceBound.toFixed(6)}]. Пропускаю.`
            );
            return;
        }

        for (const level of this.gridLevels) {
            const crossDown: boolean = prev >= level && currentPrice <= level;
            const crossUp: boolean = prev <= level && currentPrice >= level;

            if (!crossDown && !crossUp) continue;

            const qty: number = this.amountPerOrderUsd / currentPrice;

            try {
                this.sendLog(
                    `CrossDown на уровне ${level.toFixed(6)} — пытаюсь поставить BUY ${qty.toFixed(6)} @${currentPrice.toFixed(6)}`
                );

                const openSellOrders: AccountOrderV5[] =
                    await this.bybit.getOpenSellOrders();

                for (const order of openSellOrders) {
                    if (
                        Math.abs(+order.price - currentPrice) <
                        this.gridInterval * 1.9
                    ) {
                        this.sendLog(
                            `Слишком маленькое расстояние между уровнями: ${this.gridInterval} > ${Math.abs(+order.price - currentPrice)}`
                        );
                        return;
                    }
                }

                for (const order of this.ordersToSell) {
                    if (
                        Math.abs(order.price - currentPrice) <
                        this.gridInterval * 1.9
                    ) {
                        this.sendLog(
                            `Слишком маленькое расстояние между уровнями: ${this.gridInterval} > ${Math.abs(order.price - currentPrice)}`
                        );
                        return;
                    }
                }

                /*const tooClose: boolean = openSellOrders.some(
                    (o) =>
                        Math.abs(Number(o.price) - currentPrice) <
                        this.gridInterval * 0.8
                );

                if (tooClose) {
                    this.sendLog(`Слишком маленькое расстояние между уровнями`);
                    continue;
                }*/

                const buyRet: number = await this.bybit.placeOrder(
                    'Buy',
                    qty,
                    currentPrice
                );
                if (buyRet !== 0) {
                    this.sendLog(`Buy order не принят. Код ответа: ${buyRet}`);
                    return;
                }

                this.ordersToSell.push({
                    price: currentPrice,
                    qty: qty,
                });

                this.sendLog(
                    `ORDERS placed: BUY ${qty.toFixed(2)}
                    @${currentPrice.toFixed(4)} -> SELL
                    @${currentPrice.toFixed(6)}`
                );
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

        // todo: fix ESLint
        this.sendLog(
            `Grid updated: ${this.gridLevels.map(
                (order) => ' ' + order.toFixed(4)
            )}, step=${this.gridInterval.toFixed(6)}`
        );
    }
}

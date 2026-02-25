import { ReadBotDetailsDto } from '../../dto/read-bot.dto';
import { Logger } from '@nestjs/common';
import { ReadSpotGridSettingsDto } from '../../dto/read-spot-grid-settings.dto';
import { Bybit } from './bybit';
import { AccountOrderV5 } from 'bybit-api';
import {
    CalculatedQuantiles,
    calculateQuartiles,
} from '../../utils/math.utils';

interface Order {
    price: number;
    qty: number;
}

export class Bot {
    private readonly logger: Logger = new Logger(Bot.name);

    private spotGridSettings: ReadSpotGridSettingsDto;
    public symbol: string;
    private readonly maxDeposit: number;
    public candleLength: string;
    public numberOfGrids: number;
    gridInterval: number;
    public gridLevels: number[];
    public ordersToSell: Order[] = [];
    public lastPrice: number;
    public upperPriceBound: number;
    public lowerPriceBound: number;
    private readonly amountPerOrderUsd: number;
    private readonly lowerQuantile: string;
    private readonly upperQuantile: string;

    constructor(
        private readonly botSettings: ReadBotDetailsDto,
        private readonly bybit: Bybit,
        private onLog?: (payload: any) => void
    ) {
        if (!botSettings.spotGridSettings) {
            this.sendLog('No spot grid settings found!');
            return;
        }

        this.spotGridSettings = botSettings.spotGridSettings;
        this.amountPerOrderUsd =
            this.spotGridSettings.levelsSettings.pricePerBetStatic;
        this.symbol = this.spotGridSettings.crypto || 'BTCUSDT';
        this.maxDeposit = botSettings.deposit;
        this.candleLength = this.spotGridSettings.candleLength;
        this.numberOfGrids = this.spotGridSettings.levelsSettings.countStatic;

        this.lowerQuantile =
            this.spotGridSettings.gridSettings.lowerBoundDynamic;
        this.upperQuantile =
            this.spotGridSettings.gridSettings.upperBoundDynamic;
    }

    public async init(bybitService: Bybit) {
        const historicalData = await bybitService.getLastNOhlc(
            this.candleLength
        );
        const quantiles: CalculatedQuantiles | null = calculateQuartiles(
            historicalData.closes
        );

        if (!quantiles) throw new Error('No historical data found!');

        this.applyQuantiles(quantiles);
        this.updateGridBounds(this.lowerPriceBound, this.upperPriceBound);
    }

    async botMakeDecision({ currentPrice }: { currentPrice: number }) {
        const prevPrice = this.lastPrice;
        this.lastPrice = currentPrice;

        await this.processPendingSells();

        if (prevPrice === null) {
            this.sendLog('Первый тик — ожидаю следующего.');
            return;
        }

        const openSellOrders = await this.bybit.getOpenOrders('Sell');
        await this.handleStopLoss(openSellOrders);

        if (this.isPriceOutOfBounds(currentPrice)) return;

        await this.checkAndExecuteTrade(
            prevPrice,
            currentPrice,
            openSellOrders
        );
    }

    private async processPendingSells() {
        for (const order of [...this.ordersToSell]) {
            const sellPrice: number = +(order.price + this.gridInterval);
            const res: number = await this.bybit.placeOrder(
                'Sell',
                order.qty,
                sellPrice
            );

            if (res === 0) {
                this.sendLog(
                    `SELL выставлен: ${order.qty.toFixed(2)} @${sellPrice.toFixed(4)}`
                );
                this.ordersToSell = this.ordersToSell.filter(
                    (o) => o !== order
                );
            } else {
                this.sendLog(`Sell order не принят. Код: ${res}`);
            }
        }
    }

    private async handleStopLoss(openSellOrders: AccountOrderV5[]) {
        for (const order of openSellOrders) {
            if (Number(order.price) > this.upperPriceBound) {
                this.sendLog('Стоп-лосс: перемещение ордера к границе сетки');
                await this.bybit.stopLossSell(order, this.lastPrice);
            }
        }
    }

    private async checkAndExecuteTrade(
        prev: number,
        current: number,
        openSells: AccountOrderV5[]
    ) {
        for (const level of this.gridLevels) {
            const isCrossed: boolean =
                (prev >= level && current <= level) ||
                (prev <= level && current >= level);
            if (!isCrossed) continue;

            if (this.isDistanceInsufficient(current, openSells)) continue;

            await this.executeBuyOrder(current);
        }
    }

    private isDistanceInsufficient(
        currentPrice: number,
        openSells: AccountOrderV5[]
    ): boolean {
        const minDistance = this.gridInterval * 1.9;

        const tooCloseToExchangeOrder = openSells.some(
            (o: AccountOrderV5) =>
                Math.abs(Number(o.price) - currentPrice) < minDistance
        );

        const tooCloseToLocalOrder = this.ordersToSell.some(
            (order: Order) => Math.abs(order.price - currentPrice) < minDistance
        );

        if (tooCloseToExchangeOrder || tooCloseToLocalOrder) {
            this.sendLog(`Слишком близко к существующим уровням (step * 1.9)`);
            return true;
        }

        return false;
    }

    private async executeBuyOrder(price: number) {
        const qty = this.amountPerOrderUsd / price;
        this.sendLog(
            `Cross на уровне: BUY ${qty.toFixed(6)} @${price.toFixed(6)}`
        );

        try {
            const res = await this.bybit.placeOrder('Buy', qty, price);
            if (res === 0) {
                this.ordersToSell.push({ price, qty });
                this.sendLog(
                    `ORDERS placed: BUY @${price.toFixed(4)} -> SELL queue added`
                );
            } else {
                this.sendLog(`Buy order не принят. Код: ${res}`);
            }
        } catch (err) {
            this.sendLog(`Ошибка при выставлении BUY: ${err}`);
        }
    }

    private isPriceOutOfBounds(price: number): boolean {
        if (price < this.lowerPriceBound || price > this.upperPriceBound) {
            this.sendLog(`Цена ${price.toFixed(6)} вне грида. Пропускаю.`);
            return true;
        }
        return false;
    }

    public updateGridBounds(newLower: number, newUpper: number) {
        this.lowerPriceBound = newLower;
        this.upperPriceBound = newUpper;
        this.gridInterval = (newUpper - newLower) / this.numberOfGrids;

        this.gridLevels = Array.from(
            { length: this.numberOfGrids },
            (_, i) => this.lowerPriceBound + i * this.gridInterval
        );

        this.sendLog(
            `Grid updated. Range: [${newLower.toFixed(4)} - ${newUpper.toFixed(4)}], Step: ${this.gridInterval.toFixed(6)}`
        );
    }

    public applyQuantiles(q: CalculatedQuantiles) {
        const lowerMap: Record<string, number> = { min: q.min, '10%': q.Q10 };
        const upperMap: Record<string, number> = { q3: q.Q3, '90%': q.Q90 };

        this.lowerPriceBound = lowerMap[this.lowerQuantile] ?? q.Q1;
        this.upperPriceBound = upperMap[this.upperQuantile] ?? q.max;
    }

    private sendLog(message: string) {
        this.logger.log(message);
        this.onLog?.({
            botId: this.botSettings.id,
            timestamp: new Date().toISOString(),
            message,
            price: this.lastPrice,
            symbol: this.symbol,
        });
    }

    public placeInitialGridOrders(seedPrice: number) {
        const lower: number =
            Number(this.spotGridSettings.gridSettings.lowerBoundDynamic) ||
            seedPrice * 0.9;

        this.gridLevels = Array.from(
            { length: this.numberOfGrids },
            (_, i) => lower + i * (this.gridInterval || 0)
        );

        this.lastPrice = seedPrice;
        this.sendLog(
            `Initial grid. Seed: ${seedPrice}, Deposit: ${this.maxDeposit}`
        );
    }
}

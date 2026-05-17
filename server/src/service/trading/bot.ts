import { ReadBotDetailsDto } from '../../dto/read-bot.dto';
import { ReadSpotGridSettingsDto } from '../../dto/read-spot-grid-settings.dto';
import { Bybit } from './bybit';
import { AccountOrderV5 } from 'bybit-api';
import {
    CalculatedQuantiles,
    calculateQuartiles,
} from '../../utils/math.utils';
import { OrderDto, RuntimeStateDto } from '../../dto/runtime-state.dto';

// SMELL: Bloater – Large Class
export class Bot {
    private spotGridSettings: ReadSpotGridSettingsDto;
    public symbol: string;
    private readonly maxDeposit: number;
    public candleLength: string;
    public numberOfGrids: number;
    gridInterval: number;
    public gridLevels: number[];
    public ordersToSell: OrderDto[] = [];
    public lastPrice: number;
    public upperPriceBound: number;
    public lowerPriceBound: number;
    private readonly amountPerOrderUsd: number;
    private readonly lowerQuantile: string;
    private readonly upperQuantile: string;
    private readonly runtimeState: RuntimeStateDto;

    constructor(
        private readonly botSettings: ReadBotDetailsDto,
        private readonly bybit: Bybit,
        runtimeState: RuntimeStateDto
    ) {
        if (!botSettings.spotGridSettings) {
            this.runtimeState.messages?.push(
                'Ошибка! Настройки сеточного бота не найдены!'
            );
            return;
        }

        this.spotGridSettings = botSettings.spotGridSettings;
        this.amountPerOrderUsd =
            this.spotGridSettings.levelsSettings.pricePerBetStatic;

        // SMELL: Bloaters – Primitive Obsession
        this.symbol = this.spotGridSettings.crypto || 'BTCUSDT';
        this.maxDeposit = botSettings.deposit;
        this.candleLength = this.spotGridSettings.candleLength;
        this.numberOfGrids = this.spotGridSettings.levelsSettings.countStatic;

        this.lowerQuantile =
            this.spotGridSettings.gridSettings.lowerBoundDynamic;
        this.upperQuantile =
            this.spotGridSettings.gridSettings.upperBoundDynamic;

        this.runtimeState = runtimeState;
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
        this.collectDataForRuntimeState();

        const prevPrice = this.lastPrice;
        this.lastPrice = currentPrice;

        await this.processPendingSells();

        if (prevPrice === null) {
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
                this.ordersToSell = this.ordersToSell.filter(
                    (o) => o !== order
                );
            }
        }
    }

    private async handleStopLoss(openSellOrders: AccountOrderV5[]) {
        for (const order of openSellOrders) {
            if (Number(order.price) > this.upperPriceBound) {
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
            (order: OrderDto) =>
                Math.abs(order.price - currentPrice) < minDistance
        );

        return tooCloseToExchangeOrder || tooCloseToLocalOrder;
    }

    private async executeBuyOrder(price: number) {
        const qty: number = this.amountPerOrderUsd / price;
        const res: number = await this.bybit.placeOrder('Buy', qty, price);
        if (res === 0) {
            this.ordersToSell.push({ price, qty, total: qty * price });
        }
    }

    private isPriceOutOfBounds(price: number): boolean {
        return price < this.lowerPriceBound || price > this.upperPriceBound;
    }

    public updateGridBounds(newLower: number, newUpper: number) {
        this.lowerPriceBound = newLower;
        this.upperPriceBound = newUpper;
        this.gridInterval = (newUpper - newLower) / this.numberOfGrids;

        this.gridLevels = Array.from(
            { length: this.numberOfGrids },
            (_, i) => this.lowerPriceBound + i * this.gridInterval
        );

        this.runtimeState.messages?.push(`Сетка обновлена.`);
    }

    // SMELL: Bloaters – Primitive Obsession
    public applyQuantiles(q: CalculatedQuantiles) {
        const lowerMap: Record<string, number> = { min: q.min, '10%': q.Q10 };
        const upperMap: Record<string, number> = { q3: q.Q3, '90%': q.Q90 };

        this.lowerPriceBound = lowerMap[this.lowerQuantile] ?? q.Q1;
        this.upperPriceBound = upperMap[this.upperQuantile] ?? q.max;
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
        this.runtimeState.messages?.push(
            `Сетка инициализирована, начальная цена: ${seedPrice}`
        );
    }

    private collectDataForRuntimeState() {
        const usdScale: number = 2;

        this.runtimeState.lowerBound = this.lowerPriceBound;
        this.runtimeState.upperBound = this.upperPriceBound;
        this.runtimeState.step = +this.gridInterval.toFixed(
            this.bybit.priceScale
        );
        this.runtimeState.queue = this.ordersToSell.map((order: OrderDto) => {
            return {
                price: Number(order.price.toFixed(this.bybit.priceScale)),
                qty: Number(order.qty.toFixed(this.bybit.qtyScale)),
                total: Number(order.total.toFixed(usdScale)),
            };
        });
    }
}

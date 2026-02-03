import { ReadBotDetailsDto } from '../../dto/read-bot.dto';
import { Logger } from '@nestjs/common';
import { BybitService } from './bybit.service';
import { ReadSpotGridSettingsDto } from '../../dto/read-spot-grid-settings.dto';

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
    private gridInterval: number;
    private gridLevels: number[];
    private ordersToSell: Order[];
    private lastPrice: number;
    private upperPriceBound: number;
    private lowerPriceBound: number;
    private amountPerOrderUsd: number;

    constructor(
        private readonly botSettings: ReadBotDetailsDto,
        private readonly bybitService: BybitService
    ) {
        if (!botSettings.spotGridSettings) {
            this.logger.error('No spot grid settings found!');
            return;
        }

        this.spotGridSettings = botSettings.spotGridSettings;
        this.symbol = this.spotGridSettings.crypto || 'BTCUSDT';
        this.maxDeposit = botSettings.deposit;
        this.candleLength = botSettings.spotGridSettings.candleLength;
        this.numberOfGrids = this.spotGridSettings.levelsSettings.countStatic;

        const lower = this.spotGridSettings.gridSettings.lowerBoundDynamic;
        const upper = this.spotGridSettings.gridSettings.upperBoundDynamic;

        this.gridInterval = 0;

        this.logger.log(
            `Grid initialized: [${lower}–${upper}], grids=${this.numberOfGrids}, step=${this.gridInterval.toFixed(6)}`
        );
    }

    public static setupBot(
        botSettings: ReadBotDetailsDto,
        bybitService: BybitService
    ) {
        return new Bot(botSettings, bybitService);
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

        this.logger.log(`Initial grid created. Seed price: ${seedPrice}`);
    }

    async botMakeDecision({ currentPrice }: { currentPrice: number }) {
        const prev = this.lastPrice;
        this.lastPrice = currentPrice;

        // 1. Пытаемся выставить SELL для исполненных BUY
        for (const order of [...this.ordersToSell]) {
            const sellPrice = +(order.price + this.gridInterval);
            const sellRet = await this.bybitService.placeOrder(
                'Sell',
                order.qty,
                sellPrice
            );

            if (sellRet === 0) {
                this.logger.log(
                    `SELL выставлен: ${order.qty.toFixed(2)} @${sellPrice.toFixed(4)}`
                );
                this.ordersToSell = this.ordersToSell.filter(
                    (o) => o !== order
                );
            }
        }

        if (prev === null) return;

        // 2. Проверка стоп-лосса (подтягивание ордеров)
        const openSellOrders = await this.bybitService.getOpenSellOrders();
        for (const order of openSellOrders) {
            if (Number(order.price) > this.upperPriceBound) {
                await this.bybitService.stopLossSell(
                    order,
                    this.upperPriceBound
                );
            }
        }

        // 3. Проверка выхода за границы
        if (
            currentPrice < this.lowerPriceBound ||
            currentPrice > this.upperPriceBound
        ) {
            return;
        }

        // 4. Логика пересечения уровней
        for (const level of this.gridLevels) {
            const crossDown = prev >= level && currentPrice <= level;
            const crossUp = prev <= level && currentPrice >= level;

            if (!crossDown && !crossUp) continue;

            const qty = this.amountPerOrderUsd / currentPrice;

            try {
                // Проверка дистанции до существующих ордеров
                const allOpenOrders =
                    await this.bybitService.getOpenSellOrders();
                const tooClose = allOpenOrders.some(
                    (o) =>
                        Math.abs(Number(o.price) - currentPrice) <
                        this.gridInterval * 0.8
                );

                if (tooClose) continue;

                const buyRet = await this.bybitService.placeOrder(
                    'Buy',
                    qty,
                    currentPrice
                );
                if (buyRet === 0) {
                    this.ordersToSell.push({ price: currentPrice, qty: qty });
                }
            } catch (err) {
                this.logger.error('Ошибка в цикле принятия решений:', err);
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

    /*updateUsdPerAndNumberOfGrids({
        newLower,
        newUpper,
        commission = 0.001,
        profit = 0.01,
    }) {
        const a = (newLower * profit) / this.maxDeposit;
        const b = -newLower * ((1 - commission) ** 2 - 1);
        const c = -((1 - commission) ** 2) * (newUpper - newLower);

        const discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            const x = (-b + Math.sqrt(discriminant)) / (2 * a);
            this.numberOfGrids = Math.max(1, Math.floor(x));
            this.amountPerOrderUsd = this.maxDeposit / this.numberOfGrids;
        }
    }*/
}

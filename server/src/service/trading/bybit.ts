import {
    AccountOrderV5,
    APIResponseV3,
    CategoryV5,
    KlineIntervalV3,
    OHLCVKlineV5,
    OrderResultV5,
    OrderSideV5,
    RestClientV5,
    SpotInstrumentInfoV5,
} from 'bybit-api';
import { Logger } from '@nestjs/common';

export interface BotOrderDTO {
    orderId: string;
    symbol: string;
    side: OrderSideV5;
    price: string;
    qty: string;
}

export class Bybit {
    private readonly logger: Logger = new Logger(Bybit.name);

    private client: RestClientV5;
    private readonly category: CategoryV5 = 'spot';
    public priceScale: number;
    public qtyScale: number;

    constructor(
        private readonly symbol: string,
        apiKey: string,
        apiSecret: string,
        demoTrading: boolean = true,
        private onLog?: (payload: any) => void
    ) {
        this.client = new RestClientV5({
            key: apiKey,
            secret: apiSecret,
            demoTrading: demoTrading,
        });
    }

    private sendLog(message: string, price?: string) {
        this.logger.log(message);
        if (this.onLog) {
            this.onLog({
                timestamp: new Date().toISOString(),
                message: message,
                price: price,
                symbol: this.symbol,
            });
        }
    }

    async init() {
        const response = await this.client.getInstrumentsInfo({
            category: this.category,
            symbol: this.symbol,
        });
        const instrument = response.result?.list?.[0];
        if (instrument) {
            const cryptoScale = await this.getCryptoScale();

            if (!cryptoScale) {
                throw new Error(`Error in cryptoScale: ${this.symbol}`);
            }

            this.priceScale = cryptoScale.priceScale;
            this.qtyScale = cryptoScale.qtyScale;
        }
    }

    async getLatestPrice(): Promise<number> {
        const response = await this.client.getTickers({
            category: 'spot',
            symbol: `${this.symbol}USDT`,
        });
        return parseFloat(response.result.list[0].lastPrice);
    }

    async getLastNOhlc(candleLength: string | undefined) {
        try {
            const response = await this.client.getKline({
                category: 'spot',
                symbol: `${this.symbol}USDT`,
                interval: candleLength
                    ? (candleLength as KlineIntervalV3)
                    : '1',
                limit: 1000,
            });

            const candles: OHLCVKlineV5[] = response.result.list.reverse();

            return {
                opens: candles.map((c: OHLCVKlineV5) => parseFloat(c[1])),
                highs: candles.map((c: OHLCVKlineV5) => parseFloat(c[2])),
                lows: candles.map((c: OHLCVKlineV5) => parseFloat(c[3])),
                closes: candles.map((c: OHLCVKlineV5) => parseFloat(c[4])),
            };
        } catch (err) {
            this.sendLog(`getLastNOhlc exception: ${err}`);
            throw err;
        }
    }

    calcGridBounds(prices: number[], k: number) {
        const N = prices.length;
        const sum = prices.reduce((s, p) => s + p, 0);
        const mu = sum / N;

        const sorted = [...prices].sort((a, b) => a - b);
        const median =
            N % 2 === 1
                ? sorted[(N - 1) / 2]
                : (sorted[N / 2 - 1] + sorted[N / 2]) / 2;

        const variance =
            prices.map((p) => (p - mu) ** 2).reduce((s, d) => s + d, 0) / N;
        const sigma = Math.sqrt(variance);

        const lower = mu - k * sigma;
        const upper = mu + k * sigma;

        return { mu, median, sigma, lower, upper };
    }

    async placeOrder(
        side: OrderSideV5,
        qty: number,
        price: number
    ): Promise<number> {
        try {
            const res: APIResponseV3<OrderResultV5> =
                await this.client.submitOrder({
                    category: this.category,
                    symbol: `${this.symbol}USDT`,
                    side: side,
                    orderType: 'Limit',
                    qty: qty.toFixed(this.qtyScale),
                    price: price.toFixed(this.priceScale),
                    timeInForce: 'GTC',
                });

            this.sendLog(
                `submitOrder ${side} response: ${res.retMsg}`,
                price.toString()
            );
            return res.retCode;
        } catch (err) {
            this.sendLog(`placeOrder exception: ${err}`);
            return -1;
        }
    }

    async getOpenSellOrders(): Promise<AccountOrderV5[]> {
        try {
            const res = await this.client.getActiveOrders({
                category: this.category,
                symbol: `${this.symbol}USDT`,
                limit: 50,
            });
            const list = res.result?.list ?? [];
            return list.filter((p) => p.side === 'Sell');
        } catch (err) {
            this.sendLog(`getOpenSellOrders exception: ${err}`);
            return [];
        }
    }

    async stopLossSellAll(
        openOrders: AccountOrderV5[],
        stopPrice: number
    ): Promise<void> {
        for (const order of openOrders) {
            if (order.side === 'Sell') {
                await this.stopLossSell(order, stopPrice);
            }
        }
    }

    async stopLossSell(
        order: AccountOrderV5,
        stopPrice: number
    ): Promise<void> {
        try {
            await this.client.cancelOrder({
                category: this.category,
                orderId: order.orderId,
                symbol: `${this.symbol}USDT`,
            });

            await this.client.submitOrder({
                category: this.category,
                symbol: `${this.symbol}USDT`,
                side: 'Sell',
                orderType: 'Limit',
                qty: order.qty,
                price: stopPrice.toFixed(this.priceScale),
            });
        } catch (err) {
            this.sendLog(`Failed to SL order ${order.orderId}: ${err}`);
        }
    }

    async cancelOrder(order: AccountOrderV5 | BotOrderDTO): Promise<void> {
        await this.client.cancelOrder({
            category: this.category,
            symbol: `${this.symbol}USDT`,
            orderId: order.orderId,
        });
    }

    async getOpenBuyOrders(): Promise<AccountOrderV5[]> {
        try {
            const res = await this.client.getActiveOrders({
                category: this.category,
                symbol: `${this.symbol}USDT`,
                limit: 50,
            });
            const list = res.result?.list ?? [];
            return list.filter((p) => p.side === 'Buy');
        } catch (err) {
            this.sendLog(`getOpenBuyOrders exception: ${err}`);
            return [];
        }
    }

    calculateQuartiles(historicalData: number[]) {
        if (!historicalData || historicalData.length === 0) return null;

        const sorted = [...historicalData].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        const percentile = (arr: number[], p: number) => {
            const index = (arr.length - 1) * p;
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            if (lower === upper) return arr[lower];
            return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
        };

        return {
            min,
            max,
            Q1: percentile(sorted, 0.25),
            Q3: percentile(sorted, 0.75),
            Q90: percentile(sorted, 0.9),
            Q10: percentile(sorted, 0.1),
        };
    }

    async getBalance(): Promise<string> {
        try {
            const res = await this.client.getWalletBalance({
                accountType: 'UNIFIED',
            });

            const equity = res.result?.list[0]?.totalEquity ?? '0';
            return parseFloat(equity).toFixed(2);
        } catch (err) {
            this.sendLog(`getBalance exception: ${err}`);
            return '0.00';
        }
    }

    private async getCryptoScale() {
        try {
            const response = await this.client.getInstrumentsInfo({
                category: 'spot',
                symbol: `${this.symbol}USDT`,
            });

            if (
                response.result &&
                response.result.list &&
                response.result.list.length > 0
            ) {
                const instrument: SpotInstrumentInfoV5 =
                    response.result.list[0];
                return {
                    priceScale: this.getDecimalsCount(
                        instrument.priceFilter.tickSize
                    ),
                    qtyScale: this.getDecimalsCount(
                        instrument.lotSizeFilter.basePrecision
                    ),
                };
            }

            return null;
        } catch (error) {
            this.logger.error('Error fetching instrument info:', error);
            return null;
        }
    }

    private getDecimalsCount(value: string | number) {
        const valueStr = value.toString();
        if (!valueStr.includes('.')) return 0;
        return valueStr.split('.')[1].length;
    }
}

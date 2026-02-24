import {
    AccountOrderV5,
    APIResponseV3WithTime,
    CategoryV5,
    KlineIntervalV3,
    OHLCVKlineV5,
    OrderResultV5,
    OrderSideV5,
    RestClientV5,
} from 'bybit-api';
import { Logger } from '@nestjs/common';
import { getDecimalsCount } from '../../utils/math.utils';

export class Bybit {
    private readonly logger = new Logger(Bybit.name);
    private client: RestClientV5;
    private readonly category: CategoryV5 = 'spot';
    private readonly fullSymbol: string;

    public priceScale = 2;
    public qtyScale = 2;

    constructor(
        readonly symbol: string,
        apiKey: string,
        apiSecret: string,
        demoTrading = true,
        private onLog?: (payload: any) => void
    ) {
        this.fullSymbol = `${symbol}USDT`;
        this.client = new RestClientV5({
            key: apiKey,
            secret: apiSecret,
            demoTrading,
        });
    }

    private sendLog(message: string, price?: string) {
        this.logger.log(message);
        this.onLog?.({
            timestamp: new Date().toISOString(),
            message,
            price,
            symbol: this.symbol,
        });
    }

    async init() {
        const scale = await this.getCryptoScale();
        if (!scale)
            throw new Error(`Failed to init scales for ${this.fullSymbol}`);

        this.priceScale = scale.priceScale;
        this.qtyScale = scale.qtyScale;
    }

    async getLatestPrice(): Promise<number> {
        const { result } = await this.client.getTickers({
            category: 'spot',
            symbol: this.fullSymbol,
        });
        return parseFloat(result.list[0].lastPrice);
    }

    async getLastNOhlc(interval: string = '1') {
        try {
            const { result } = await this.client.getKline({
                category: 'spot',
                symbol: this.fullSymbol,
                interval: interval as KlineIntervalV3,
                limit: 1000,
            });

            const candles: OHLCVKlineV5[] = result.list.reverse();
            return {
                opens: candles.map((c) => parseFloat(c[1])),
                highs: candles.map((c) => parseFloat(c[2])),
                lows: candles.map((c) => parseFloat(c[3])),
                closes: candles.map((c) => parseFloat(c[4])),
            };
        } catch (err) {
            this.handleError('getLastNOhlc', err);
            throw err;
        }
    }

    async placeOrder(
        side: OrderSideV5,
        qty: number,
        price: number
    ): Promise<number> {
        try {
            const res: APIResponseV3WithTime<OrderResultV5> =
                await this.client.submitOrder({
                    category: this.category,
                    symbol: this.fullSymbol,
                    side,
                    orderType: 'Limit',
                    qty: qty.toFixed(this.qtyScale),
                    price: price.toFixed(this.priceScale),
                    timeInForce: 'GTC',
                });

            this.sendLog(
                `Order ${side} placed: ${res.retMsg}`,
                price.toString()
            );
            return res.retCode;
        } catch (err) {
            this.handleError(`placeOrder ${side}`, err);
            return -1;
        }
    }

    async getOpenOrders(side?: OrderSideV5): Promise<AccountOrderV5[]> {
        try {
            const { result } = await this.client.getActiveOrders({
                category: this.category,
                symbol: this.fullSymbol,
                limit: 50,
            });
            const orders: AccountOrderV5[] = result?.list ?? [];
            return side
                ? orders.filter((o: AccountOrderV5) => o.side === side)
                : orders;
        } catch (err) {
            this.handleError('getOpenOrders', err);
            return [];
        }
    }

    async stopLossSell(
        order: AccountOrderV5,
        stopPrice: number
    ): Promise<void> {
        try {
            await this.cancelOrder(order.orderId);
            await this.placeOrder('Sell', parseFloat(order.qty), stopPrice);
        } catch (err) {
            this.sendLog(`SL failed for ${order.orderId}: ${err}`);
        }
    }

    async cancelOrder(orderId: string | undefined): Promise<void> {
        await this.client.cancelOrder({
            category: this.category,
            symbol: this.fullSymbol,
            orderId,
        });
    }

    public async getCryptoScale() {
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
                const instrument = response.result.list[0];
                return {
                    priceScale: getDecimalsCount(
                        instrument.priceFilter.tickSize
                    ),
                    qtyScale: getDecimalsCount(
                        instrument.lotSizeFilter.basePrecision
                    ),
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching instrument info:', error);
            return null;
        }
    }

    private handleError(context: string, err: any) {
        this.sendLog(`${context} exception: ${err}`);
    }
}

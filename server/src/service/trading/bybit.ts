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
import { getDecimalsCount } from '../../utils/math.utils';
import { OrderDto, RuntimeStateDto } from '../../dto/runtime-state.dto';
import { mapAccountOrdersToOrdersDto } from '../../mapper/order.mapper';

// SMELL: Bloater – Large Class
export class Bybit {
    private client: RestClientV5;
    private readonly category: CategoryV5 = 'spot';
    private readonly fullSymbol: string;
    private readonly runtimeState: RuntimeStateDto;

    // SMELL: Bloaters – Data Clumps
    public priceScale: number = 2;
    public qtyScale: number = 2;

    // SMELL: Bloaters – Long Parameter List
    constructor(
        readonly symbol: string,
        // SMELL: Bloaters – Data Clumps
        apiKey: string,
        apiSecret: string,
        demoTrading = true,
        runtimeState: RuntimeStateDto
    ) {
        // SMELL: Bloaters – Primitive Obsession
        this.fullSymbol = `${symbol}USDT`;
        this.client = new RestClientV5({
            key: apiKey,
            secret: apiSecret,
            demoTrading,
        });
        this.runtimeState = runtimeState;
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
        const currentPrice: number = parseFloat(result.list[0].lastPrice);
        this.runtimeState.currentPrice = currentPrice;
        return currentPrice;
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
            this.handleError('Не удалось получить свечи', err);
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

            // SMELL: Bloaters – Primitive Obsession
            if (res.retCode === 0) {
                this.runtimeState.messages?.push(
                    `${side}-ордер выставлен по цене ${price.toString()}`
                );
            }
            return res.retCode;
        } catch (err) {
            this.handleError(`Не удалось выставить ${side}-ордер`, err);
            return -1;
        }
    }

    // SMELL: Bloater – Long Method
    async getOpenOrders(side?: OrderSideV5): Promise<AccountOrderV5[]> {
        try {
            const { result } = await this.client.getActiveOrders({
                category: this.category,
                symbol: this.fullSymbol,
                limit: 50,
            });
            const orders: AccountOrderV5[] = result?.list ?? [];
            const filteredOrders: AccountOrderV5[] = side
                ? orders.filter((o: AccountOrderV5) => o.side === side)
                : orders;

            const mappedOrders: OrderDto[] = mapAccountOrdersToOrdersDto(
                filteredOrders,
                this.priceScale,
                this.qtyScale
            );

            if (side) {
                this.addOrdersToRuntimeState(
                    this.runtimeState,
                    mappedOrders,
                    side
                );
            }

            return filteredOrders;
        } catch (err) {
            this.handleError(
                `Не удалось получить открытые ${side}-ордеры`,
                err
            );
            return [];
        }
    }

    async stopLossSell(
        order: AccountOrderV5,
        stopPrice: number
    ): Promise<void> {
        try {
            this.runtimeState.messages?.push('Выполняется стоп-лосс...');
            await this.cancelOrder(order.orderId);
            await this.placeOrder('Sell', parseFloat(order.qty), stopPrice);
            this.runtimeState.messages?.push('Стоп-лосс выполнен успешно');
        } catch (err) {
            this.handleError(
                `Не удалось выполнить стоп-лосс (цена ордера - ${order.price})`,
                err
            );
        }
    }

    async cancelOrder(orderId: string | undefined): Promise<void> {
        await this.client.cancelOrder({
            category: this.category,
            symbol: this.fullSymbol,
            orderId: orderId,
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
                    // SMELL: Bloaters – Data Clumps
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
        this.runtimeState.messages?.push(`Ошибка! ${context}, ${err.message}`);
    }

    private addOrdersToRuntimeState = (
        runtimeState: RuntimeStateDto,
        orders: OrderDto[],
        side: OrderSideV5
    ) => {
        switch (side) {
            case 'Sell':
                runtimeState.sellOrders = orders;
                break;
            case 'Buy':
                runtimeState.buyOrders = orders;
                break;
            default:
                break;
        }
    };
}

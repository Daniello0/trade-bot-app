import { AccountOrderV5 } from 'bybit-api';
import { OrderDto } from '../dto/runtime-state.dto';

export const mapAccountOrdersToOrdersDto = (
    accountOrders: AccountOrderV5[],
    priceScale: number,
    qtyScale: number
): OrderDto[] => {
    const usdScale = 2;

    return accountOrders.map((o) => {
        const price = Number(o.price);
        const qty = Number(o.qty);
        const total = price * qty;

        return {
            price: Number(price.toFixed(priceScale)),
            qty: Number(qty.toFixed(qtyScale)),
            total: Number(total.toFixed(usdScale)),
        };
    });
};

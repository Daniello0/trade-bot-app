import { AccountOrderV5 } from 'bybit-api';
import { OrderDto } from '../dto/runtime-state.dto';

// SMELL: Bloaters – Primitive Obsession
export const mapAccountOrdersToOrdersDto = (
    accountOrders: AccountOrderV5[],
    // SMELL: Bloaters – Data Clumps
    priceScale: number,
    qtyScale: number
): OrderDto[] => {
    // SMELL: Bloaters – Primitive Obsession
    const usdScale = 2;

    return accountOrders.map((o) => {
        // SMELL: Bloaters – Data Clumps
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

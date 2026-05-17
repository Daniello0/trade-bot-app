import { IsArray, IsNumber, IsOptional } from 'class-validator';

// SMELL: Bloaters – Primitive Obsession
// SMELL: Bloaters – Data Clumps
export class OrderDto {
    @IsNumber()
    price: number;

    @IsNumber()
    qty: number;

    @IsNumber()
    total: number;
}

export class RuntimeStateDto {
    @IsNumber()
    @IsOptional()
    currentPrice?: number;

    @IsNumber()
    @IsOptional()
    lowerBound?: number;

    @IsNumber()
    @IsOptional()
    upperBound?: number;

    @IsNumber()
    @IsOptional()
    step?: number;

    @IsArray()
    @IsOptional()
    sellOrders?: OrderDto[];

    @IsArray()
    @IsOptional()
    buyOrders?: OrderDto[];

    @IsArray()
    @IsOptional()
    queue?: OrderDto[];

    @IsArray()
    @IsOptional()
    messages?: string[];
}

export interface CreateGridSettings {
    lowerBoundDynamic: string;
    upperBoundDynamic: string;
}

export interface CreateLevelsSettings {
    countStatic: number;
    pricePerBetStatic: number;
}

export interface CreateSpotGridSettings {
    candleLength: string;
    crypto: string;
    gridSettings: CreateGridSettings;
    levelsSettings: CreateLevelsSettings;
}

interface ReadLevelsSettings {
    countStatic: number;
    pricePerBetStatic: number;
}

interface ReadGridSettings {
    lowerBoundDynamic: string;
    upperBoundDynamic: string;
}

interface ReadSpotGridSettings {
    candleLength: number;
    crypto: string;
    gridSettings: ReadGridSettings;
    levelsSettings: ReadLevelsSettings;
}

export interface CreateBot {
    name: string;
    deposit: number;
    botType: string;
    spotGridSettingsData?: CreateSpotGridSettings;
    fullSpotSettingsData?: any;
}

export interface ReadBotSummary {
    id: number;
    name: string;
    botType: 'spotGrid' | 'fullSpot';
    status: 'stopped' | 'running';
}

export interface ReadBotDetails {
    id: number;
    userId: string;
    name: string;
    deposit: number;
    botType: string;
    status: 'stopped' | 'running';
    fullSpotSettings?: any;
    spotGridSettings?: ReadSpotGridSettings;
}

export interface UserKeys {
    apiKey: string;
    apiSecret: string;
}

export interface Log {
    timestamp: string;
    message: string;
    price: number;
}

export interface ReadUser {
    id: string;
    email: string;
    name: string;
}

export interface Order {
    price: number;
    qty: number;
    total: number;
}

export interface RuntimeState {
    currentPrice?: number,
    lowerBound?: number,
    upperBound?: number,
    step?: number,
    sellOrders?: Order[],
    buyOrders?: Order[],
    queue?: Order[]
    messages?: string[]
}

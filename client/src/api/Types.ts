export interface CreateGridSettings {
    type: string;
    lowerBoundStatic?: number;
    upperBoundStatic?: number;
    lowerBoundDynamic?: string;
    upperBoundDynamic?: string;
}

export interface CreateLevelsSettings {
    type: string;
    countStatic?: number;
    pricePerBetStatic?: number;
    profitDynamic?: number;
}

export interface CreateSpotGridSettings {
    historyLength: number;
    candleLength: string;
    crypto: string;
    stopLossType: string;
    updateGridIntervalType: string;
    updateGridIntervalTime?: number;
    gridSettings: CreateGridSettings;
    levelsSettings: CreateLevelsSettings;
}

interface ReadLevelsSettings {
    type: string;
    countStatic?: number;
    pricePerBetStatic?: number;
    profitDynamic?: number;
}

interface ReadGridSettings {
    type: string;
    lowerBoundStatic?: number;
    upperBoundStatic?: number;
    lowerBoundDynamic?: string;
    upperBoundDynamic?: string;
}

interface ReadSpotGridSettings {
    historyLength: number;
    candleLength: number;
    crypto: string;
    stopLossType: string;
    updateGridIntervalType: string;
    updateGridIntervalTime?: number;
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
    botType: string;
}

export interface ReadBotDetails {
    id: number;
    userId: string;
    name: string;
    deposit: number;
    botType: string;
    fullSpotSettings?: any;
    spotGridSettings?: ReadSpotGridSettings;
}

export interface UserKeys {
    apiKey: string;
    apiSecret: string;
}

export interface SpotGridSettings {
    historyLength: number;
    candleLength: string;
    crypto: string;
    gridSizeType: 'static' | 'auto';
    staticGrid?: { lowerBound: number, upperBound: number };
    autoGrid?: { lower: string, upper: string };
    levelCountType: 'static' | 'dynamic';
    staticLevels?: { count: number, pricePerBet: number };
    dynamicLevels?: { profitPerLevel: number };
    stopLossType: string;
    updateGridIntervalType?: string;
    updateGridIntervalTime?: number;
}
export interface FullSpotSettings {
    ignoreList: string;
    maxActiveCryptos: number;
    pricePerBet: number;
    cryptoListType: 'manual' | 'auto';
    manualCryptoList?: string[];
    indicators: string[];
    profitPerCrypto: number;
    stopLossType: 'none' | 'interval' | 'time' | 'interval_and_time';
    stopLossIntervalValue?: number;
    stopLossTimeValue?: number;
}
import { CreateBot } from "../api/Types";

export const DEFAULT_SPOT_GRID_VALUES = {
    candleLength: '1',
    crypto: 'BTC',
    gridSettings: { lowerBoundDynamic: 'q1', upperBoundDynamic: 'q3' },
    levelsSettings: { countStatic: 10, pricePerBetStatic: 100 },
};

export const INITIAL_BOT_FORM: CreateBot = {
    botType: 'spotGrid',
    name: 'Мой бот',
    deposit: 1000,
    spotGridSettingsData: DEFAULT_SPOT_GRID_VALUES,
    fullSpotSettingsData: undefined,
};
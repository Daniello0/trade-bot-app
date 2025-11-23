import { FullSpotSettings } from "./FullSpotBot";
import { SpotGridSettings } from "./SpotGridBot";

interface BaseBotConfig {
    name: string;
    deposit: number;
}

export interface SpotGridBotConfig extends BaseBotConfig {
    botType: 'spotGrid';
    settings: SpotGridSettings;
}

export interface FullSpotBotConfig extends BaseBotConfig {
    botType: 'fullSpot';
    settings: FullSpotSettings;
}

export type BotConfig = SpotGridBotConfig | FullSpotBotConfig;
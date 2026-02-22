import { CreateBot, CreateSpotGridSettings, ReadBotDetails } from "../api/Types";

export const mapReadBotToCreateBot = (bot: ReadBotDetails): CreateBot => {
    const { spotGridSettings, fullSpotSettings, name, deposit, botType } = bot;

    const spotGridSettingsData: CreateSpotGridSettings | undefined = spotGridSettings
        ? {
            candleLength: String(spotGridSettings.candleLength),
            crypto: spotGridSettings.crypto,
            gridSettings: {
                lowerBoundDynamic: spotGridSettings.gridSettings.lowerBoundDynamic,
                upperBoundDynamic: spotGridSettings.gridSettings.upperBoundDynamic,
            },
            levelsSettings: {
                countStatic: spotGridSettings.levelsSettings.countStatic,
                pricePerBetStatic: spotGridSettings.levelsSettings.pricePerBetStatic,
            },
        }
        : undefined;

    return {
        name,
        deposit,
        botType,
        spotGridSettingsData,
        fullSpotSettingsData: fullSpotSettings,
    };
};
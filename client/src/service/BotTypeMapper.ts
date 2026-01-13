import { CreateBot, CreateSpotGridSettings, ReadBotDetails } from "../api/Types";

export const mapReadBotToCreateBot = (bot: ReadBotDetails): CreateBot => {
    let spotGridSettingsData: CreateSpotGridSettings | undefined = undefined;

    if (bot.spotGridSettings) {
        spotGridSettingsData = {
            candleLength: String(bot.spotGridSettings.candleLength),
            crypto: bot.spotGridSettings.crypto,
            gridSettings: {
                lowerBoundDynamic: bot.spotGridSettings.gridSettings.lowerBoundDynamic,
                upperBoundDynamic: bot.spotGridSettings.gridSettings.upperBoundDynamic,
            },
            levelsSettings: {
                countStatic: bot.spotGridSettings.levelsSettings.countStatic,
                pricePerBetStatic: bot.spotGridSettings.levelsSettings.pricePerBetStatic,
            },
        };
    }

    return {
        name: bot.name,
        deposit: bot.deposit,
        botType: bot.botType,
        spotGridSettingsData,
        fullSpotSettingsData: bot.fullSpotSettings,
    };
};

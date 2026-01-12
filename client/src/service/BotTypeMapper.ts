import { CreateBot, CreateSpotGridSettings, ReadBotDetails } from "../api/Types";

export const mapReadBotToCreateBot = (bot: ReadBotDetails): CreateBot => {
    let spotGridSettingsData: CreateSpotGridSettings | undefined = undefined;

    if (bot.spotGridSettings) {
        spotGridSettingsData = {
            historyLength: bot.spotGridSettings.historyLength,
            candleLength: String(bot.spotGridSettings.candleLength),
            crypto: bot.spotGridSettings.crypto,
            stopLossType: bot.spotGridSettings.stopLossType,
            updateGridIntervalType: bot.spotGridSettings.updateGridIntervalType,
            updateGridIntervalTime: bot.spotGridSettings.updateGridIntervalTime,
            gridSettings: {
                type: bot.spotGridSettings.gridSettings.type,
                lowerBoundStatic: bot.spotGridSettings.gridSettings.lowerBoundStatic,
                upperBoundStatic: bot.spotGridSettings.gridSettings.upperBoundStatic,
                lowerBoundDynamic: bot.spotGridSettings.gridSettings.lowerBoundDynamic,
                upperBoundDynamic: bot.spotGridSettings.gridSettings.upperBoundDynamic,
            },
            levelsSettings: {
                type: bot.spotGridSettings.levelsSettings.type,
                countStatic: bot.spotGridSettings.levelsSettings.countStatic,
                pricePerBetStatic: bot.spotGridSettings.levelsSettings.pricePerBetStatic,
                profitDynamic: bot.spotGridSettings.levelsSettings.profitDynamic,
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

import { Bots } from '../entity/Bots';
import { ReadBotDetailsDto } from '../dto/read-bot.dto';
import { ReadSpotGridSettingsDto } from '../dto/read-spot-grid-settings.dto';
import { ReadGridSettingsDto } from '../dto/read-grid-settings.dto';
import { ReadLevelsSettingsDto } from '../dto/read-levels-settings.dto';

export const mapBotToReadBotDetailsDto = (
    bot: Bots | null
): ReadBotDetailsDto | null => {
    if (!bot) {
        return null;
    }

    let spotGridSettingsDto: ReadSpotGridSettingsDto | undefined = undefined;

    if (bot.spotGridSettings) {
        const spotSettings = bot.spotGridSettings;

        const gridSettingsDto: ReadGridSettingsDto = {
            type: spotSettings.gridSettings.type,
            lowerBoundStatic: spotSettings.gridSettings.lowerBoundStatic,
            upperBoundStatic: spotSettings.gridSettings.upperBoundStatic,
            lowerBoundDynamic: spotSettings.gridSettings.lowerBoundDynamic,
            upperBoundDynamic: spotSettings.gridSettings.upperBoundDynamic,
        };

        const levelsSettingsDto: ReadLevelsSettingsDto = {
            type: spotSettings.levelsSettings.type,
            countStatic: spotSettings.levelsSettings.countStatic,
            pricePerBetStatic: spotSettings.levelsSettings.pricePerBetStatic,
            profitDynamic: spotSettings.levelsSettings.profitDynamic,
        };

        spotGridSettingsDto = {
            historyLength: spotSettings.historyLength,
            candleLength: spotSettings.candleLength,
            crypto: spotSettings.crypto,
            stopLossType: spotSettings.stopLossType,
            updateGridIntervalType: spotSettings.updateGridIntervalType,
            updateGridIntervalTime: spotSettings.updateGridIntervalTime,
            gridSettings: gridSettingsDto,
            levelsSettings: levelsSettingsDto,
        };
    }

    return {
        id: bot.id,
        name: bot.name,
        botType: bot.botType,
        deposit: bot.deposit,
        spotGridSettings: spotGridSettingsDto,
    };
};

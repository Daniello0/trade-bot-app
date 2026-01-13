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
            lowerBoundDynamic: spotSettings.gridSettings.lowerBoundDynamic,
            upperBoundDynamic: spotSettings.gridSettings.upperBoundDynamic,
        };

        const levelsSettingsDto: ReadLevelsSettingsDto = {
            countStatic: spotSettings.levelsSettings.countStatic,
            pricePerBetStatic: spotSettings.levelsSettings.pricePerBetStatic,
        };

        spotGridSettingsDto = {
            candleLength: spotSettings.candleLength,
            crypto: spotSettings.crypto,
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

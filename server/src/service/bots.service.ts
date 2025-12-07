import { Injectable } from '@nestjs/common';
import {
    botCreationParams,
    createBotService,
    getAllBotsService,
    getBotService,
} from './database/bot_service/BotService';

@Injectable()
export class BotService {
    async getBot(botData: {
        userId: string;
        botId: number;
        botType: string;
    }): Promise<string> {
        return JSON.stringify(await getBotService(botData));
    }

    async getBotSummary(botData: {
        userId: string;
        botId: number;
        botType: string;
    }): Promise<string> {
        return JSON.stringify(await getBotService(botData));
    }

    async getBotDetails(botData: {
        userId: string;
        botId: number;
        botType: string;
    }): Promise<string> {
        return JSON.stringify(await getBotService(botData));
    }

    async createBot(botParams: botCreationParams): Promise<void> {
        await createBotService(botParams);
    }

    async getAllBots(userId: string): Promise<string> {
        return JSON.stringify(await getAllBotsService(userId));
    }
}

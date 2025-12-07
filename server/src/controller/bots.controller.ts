import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { BotService } from '../service/bots.service';
import type { botCreationParams } from '../service/database/bot_service/BotService';

@Controller('users/:userId/bots')
export class BotsController {
    constructor(private readonly botService: BotService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBot(
        @Param('userId') userId: string,
        @Body() createBotDto: botCreationParams
    ): Promise<void> {
        const botParams = {
            ...createBotDto,
            user_id: userId,
        };
        return this.botService.createBot(botParams);
    }

    @Get()
    async getAllBots(@Param('userId') userId: string): Promise<string> {
        return this.botService.getAllBots(userId);
    }

    @Get(':botId')
    async getBot(
        @Param('userId') userId: string,
        @Param('botId', ParseIntPipe) botId: number,
        @Query('botType') botType: string
    ): Promise<string> {
        const botData = { userId, botId, botType };
        return this.botService.getBot(botData);
    }
}

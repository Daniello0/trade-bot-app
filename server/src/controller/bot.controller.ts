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
import { CreateBotDto } from '../dto/create_dto/create-bot-dto';
import { ReadBotSummaryDto } from '../dto/read_dto/read-bot.dto';

@Controller('users/:userId/bots')
export class BotController {
    constructor(private readonly botService: BotService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBot(
        @Param('userId') userId: string,
        @Body() createBotDto: CreateBotDto
    ): Promise<void> {
        const botParams = {
            ...createBotDto,
            user_id: userId,
        };
        return this.botService.createBot(botParams, userId);
    }

    @Get()
    async getAllBotsSummary(
        @Param('userId') userId: string
    ): Promise<ReadBotSummaryDto[] | undefined> {
        return this.botService.getAllBotsSummary(userId);
    }

    @Get(':botId/summary')
    async getBotSummary(
        @Param('userId') userId: string,
        @Param('botId', ParseIntPipe) botId: number,
        @Query('botType') botType: string
    ): Promise<ReadBotSummaryDto | null> {
        const botData = { userId, botId, botType };
        return this.botService.getBotSummary(botData);
    }

    @Get(':botId/details')
    async getBotDetails(
        @Param('userId') userId: string,
        @Param('botId', ParseIntPipe) botId: number,
        @Query('botType') botType: string
    ): Promise<ReadBotSummaryDto | null> {
        const botData = { userId, botId, botType };
        return this.botService.getBotDetails(botData);
    }
}

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { BotService } from '../service/bots.service';
import { CreateBotDto } from '../dto/create_dto/create-bot-dto';
import {
    ReadBotDetailsDto,
    ReadBotSummaryDto,
} from '../dto/read_dto/read-bot.dto';
import * as user_idMiddleware from '../middleware/user_id.middleware';

@Controller('/bots')
export class BotController {
    constructor(private readonly botService: BotService) {}

    @Post('/create')
    @HttpCode(HttpStatus.CREATED)
    async createBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Body() createBotDto: CreateBotDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;

        if (userId) {
            return this.botService.createBot(createBotDto, userId);
        } else {
            throw new Error('User id is not defined.');
        }
    }

    @Get('/all')
    async getAllBotsSummary(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<ReadBotSummaryDto[] | undefined> {
        const userId: string | undefined = req.userId;
        if (userId) {
            return this.botService.getAllBotsSummary(userId);
        } else {
            throw new Error('User id is not defined.');
        }
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
    ): Promise<ReadBotDetailsDto | null> {
        const botData = { userId, botId, botType };
        return this.botService.getBotDetails(botData);
    }
}

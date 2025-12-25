import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import { BotService } from '../service/bot.service';
import { CreateBotDto } from '../dto/create-bot-dto';
import { ReadBotDetailsDto, ReadBotSummaryDto } from '../dto/read-bot.dto';
import * as user_idMiddleware from '../middleware/user-id.middleware';
import { Bots } from '../entity/Bots';

@Controller('/bots')
export class BotController {
    constructor(private readonly botService: BotService) {}

    @Post('/create')
    @HttpCode(HttpStatus.CREATED)
    async createBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Body() createBotDto: CreateBotDto
    ): Promise<Bots> {
        const userId: string | undefined = req.userId;
        return this.botService.create(createBotDto, userId);
    }

    @Get('/all')
    async getAllBotsSummary(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<ReadBotSummaryDto[] | undefined> {
        const userId: string | undefined = req.userId;
        return this.botService.findAllSummaries(userId);
    }

    @Get(':botId/details')
    async getBotDetails(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<ReadBotDetailsDto | null> {
        const userId: string | undefined = req.userId;
        const botData = { userId, botId };
        return this.botService.findOneDetails(botData);
    }

    @Delete(':botId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.botService.remove(botId, userId);
    }

    @Patch(':botId')
    async updateBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number,
        @Body() updateBotData: CreateBotDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.botService.update(botId, userId, updateBotData);
    }
}

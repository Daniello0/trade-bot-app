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
    Query,
    Req,
} from '@nestjs/common';
import { BotService } from '../service/bots.service';
import { CreateBotDto } from '../dto/create_dto/create-bot-dto';
import {
    ReadBotDetailsDto,
    ReadBotSummaryDto,
} from '../dto/read_dto/read-bot.dto';
import * as user_idMiddleware from '../middleware/user-id.middleware';

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

    // todo delete?
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
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<ReadBotDetailsDto | null> {
        const userId: string | undefined = req.userId;
        if (userId) {
            const botData = { userId, botId };
            return this.botService.getBotDetails(botData);
        } else {
            throw new Error('User id is not defined.');
        }
    }

    @Delete(':botId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<void> {
        const userId: string | undefined = req.userId;

        if (userId) {
            return this.botService.deleteBot(botId, userId);
        } else {
            throw new Error('User id is not defined.');
        }
    }

    @Patch(':botId')
    async updateBot(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number,
        @Body() updateBotData: CreateBotDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;

        if (userId) {
            return this.botService.updateBot(botId, userId, updateBotData);
        } else {
            throw new Error('User id is not defined.');
        }
    }
}

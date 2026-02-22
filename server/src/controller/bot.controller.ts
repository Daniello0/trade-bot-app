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
    UseGuards,
} from '@nestjs/common';
import { BotSettingsService } from '../service/database/bot-settings.service';
import { CreateBotDto } from '../dto/create-bot-dto';
import { ReadBotDetailsDto, ReadBotSummaryDto } from '../dto/read-bot.dto';
import * as user_idGuard from '../guard/auth.guard';
import { Bots } from '../entity/Bots';
import { BotManagerService } from '../service/trading/bot-manager.service';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/bots')
export class BotController {
    constructor(
        private readonly botService: BotSettingsService,
        private readonly botManager: BotManagerService
    ) {}

    @Post('/create')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createBot(
        @Req() req: user_idGuard.RequestWithUserId,
        @Body() createBotDto: CreateBotDto
    ): Promise<Bots> {
        const userEmail: string | undefined = req.userEmail;
        return this.botService.create(createBotDto, userEmail);
    }

    @Get('/all')
    @UseGuards(AuthGuard)
    async getAllBotsSummary(
        @Req() req: user_idGuard.RequestWithUserId
    ): Promise<ReadBotSummaryDto[] | undefined> {
        const userId: string | undefined = req.userId;
        return this.botService.findAllSummaries(userId);
    }

    @Get(':botId/details')
    @UseGuards(AuthGuard)
    async getBotDetails(
        @Req() req: user_idGuard.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<ReadBotDetailsDto | null> {
        const userId: string | undefined = req.userId;
        const botData = { userId, botId };
        return this.botService.findOneDetails(botData);
    }

    @Delete(':botId')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBot(
        @Req() req: user_idGuard.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.botService.remove(botId, userId);
    }

    @Patch(':botId')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateBot(
        @Req() req: user_idGuard.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number,
        @Body() updateBotData: CreateBotDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.botService.update(botId, userId, updateBotData);
    }

    @Post(':botId/toggle')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async toggleBot(
        @Req() req: user_idGuard.RequestWithUserId,
        @Param('botId', ParseIntPipe) botId: number
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.botManager.toggleBot(userId, botId);
    }
}

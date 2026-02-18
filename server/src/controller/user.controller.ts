import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserKeysService } from '../service/user/user-keys.service';
import * as user_idGuard from '../guard/auth.guard';
import { CreateUserKeysDto } from '../dto/create-user-keys.dto';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserKeysService) {}

    @Post('/keys')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async addKeys(
        @Req() req: user_idGuard.RequestWithUserId,
        @Body() { apiKey, apiSecret }: CreateUserKeysDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.userService.saveApiKeys(userId, apiKey, apiSecret);
    }

    @Get('/keys')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getKeys(
        @Req() req: user_idGuard.RequestWithUserId
    ): Promise<{ apiKey: string; apiSecret: string }> {
        const userId: string | undefined = req.userId;
        return this.userService.getApiKeys(userId);
    }
}

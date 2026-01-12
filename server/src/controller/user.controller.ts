import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import * as user_idMiddleware from '../middleware/user-id.middleware';
import { CreateUserKeysDto } from '../dto/create-user-keys.dto';

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/keys')
    @HttpCode(HttpStatus.OK)
    async addKeys(
        @Req() req: user_idMiddleware.RequestWithUserId,
        @Body() { apiKey, apiSecret }: CreateUserKeysDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        return this.userService.saveApiKeys(userId, apiKey, apiSecret);
    }

    @Get('/keys')
    @HttpCode(HttpStatus.OK)
    async getKeys(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<{ apiKey: string; apiSecret: string }> {
        const userId: string | undefined = req.userId;
        return this.userService.getApiKeys(userId);
    }
}

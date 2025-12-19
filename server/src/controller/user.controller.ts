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
        @Body() { api_key, api_secret }: CreateUserKeysDto
    ): Promise<void> {
        const userId: string | undefined = req.userId;
        if (userId) {
            return this.userService.saveApiKeys(userId, api_key, api_secret);
        } else {
            throw new Error('User id is not defined.');
        }
    }

    @Get('/keys')
    @HttpCode(HttpStatus.OK)
    async getKeys(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<{ api_key: string; api_secret: string }> {
        const userId: string | undefined = req.userId;
        if (userId) {
            return this.userService.getApiKeys(userId);
        } else {
            throw new Error('User id is not defined.');
        }
    }
}

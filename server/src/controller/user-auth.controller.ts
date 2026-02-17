import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import * as user_idMiddleware from '../middleware/user-id.middleware';
import { UserAuthService } from '../service/user/user-auth.service';
import { ReadUserDto } from '../dto/read-user.dto';

@Controller('user/auth')
export class UserAuthController {
    constructor(private readonly userAuthService: UserAuthService) {}

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() idToken: string): Promise<void> {
        await this.userAuthService.loginUser(idToken);
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    async auth(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<ReadUserDto> {
        const userId: string | undefined = req.userId;
        const authUser: ReadUserDto | undefined =
            await this.userAuthService.auth(userId);
        if (authUser) return authUser;
        else throw new Error('Ошибка при авторизации');
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Req() req: user_idMiddleware.RequestWithUserId
    ): Promise<void> {
        // clear cookie
    }
}

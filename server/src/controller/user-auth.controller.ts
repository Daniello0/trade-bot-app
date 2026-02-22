import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import * as user_idGuard from '../guard/auth.guard';
import { UserAuthService } from '../service/user/user-auth.service';
import { ReadUserDto } from '../dto/read-user.dto';
import { LoginDto } from '../dto/login.dto';
import express, { Response } from 'express';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/user/auth')
export class UserAuthController {
    constructor(private readonly userAuthService: UserAuthService) {}

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res() res: express.Response,
        @Req() req: user_idGuard.RequestWithUserId
    ): Promise<void> {
        const newUserId: string | undefined =
            await this.userAuthService.loginUser(loginDto.idToken);

        this.addCookie(newUserId, res, req);

        res.sendStatus(HttpStatus.OK).send();
    }

    @Get('/')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async auth(
        @Req() req: user_idGuard.RequestWithUserId
    ): Promise<ReadUserDto> {
        const userId: string | undefined = req.userId;
        const authUser: ReadUserDto | undefined =
            await this.userAuthService.auth(userId);
        if (authUser) return authUser;
        else throw new UnauthorizedException('Ошибка при авторизации');
    }

    @Post('/logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Res() res: express.Response): void {
        this.clearCookie(res);
        res.sendStatus(HttpStatus.OK).send();
    }

    addCookie(
        userId: string | undefined,
        res: Response,
        req: user_idGuard.RequestWithUserId
    ): void {
        if (userId) {
            res.cookie('userId', userId, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/',
            });
            req.userId = userId;
        } else {
            throw new Error(
                'Не удалось установить cookie userId (user-auth.controller.ts, line 69)'
            );
        }
    }

    clearCookie(res: Response): void {
        res.clearCookie('userId', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
    }
}

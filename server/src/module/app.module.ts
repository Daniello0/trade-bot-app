import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { AssignUserIdMiddleware } from '../middleware/user-id.middleware';
import { BotService } from '../service/bots.service';
import { BotController } from '../controller/bot.controller';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { CryptoService } from '../service/crypto.service';

@Module({
    imports: [],
    controllers: [AppController, BotController, UserController],
    providers: [AppService, BotService, UserService, CryptoService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AssignUserIdMiddleware).forRoutes('*');
    }
}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { AssignUserIdMiddleware } from '../middleware/user_id.middleware';
import { BotService } from '../service/bots.service';
import { BotController } from '../controller/bot.controller';

@Module({
    imports: [],
    controllers: [AppController, BotController],
    providers: [AppService, BotService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AssignUserIdMiddleware).forRoutes('*');
    }
}

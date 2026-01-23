import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as process from 'node:process';

@WebSocketGateway({
    cors: { origin: process.env.CLIENT_ORIGIN },
})
@Injectable()
export class BotGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('BotGateway');

    afterInit(/*server: Server*/) {
        this.logger.log('WebSocket Server Initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('watchBot')
    async handleWatchBot(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { botId: string }
    ) {
        await client.join(`bot_${data.botId}`);
    }
}

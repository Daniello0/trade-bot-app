// src/bots/bot-runner.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { BotGateway } from '../gateway/bot.gateway';

@Injectable()
export class BotManagerService implements OnModuleDestroy {
    private readonly logger = new Logger(BotManagerService.name);

    // Наш "пул" — Map, где ключ это botId, а значение — контроллер для остановки
    private activeBots = new Map<string, AbortController>();

    constructor(private readonly botGateway: BotGateway) {}

    startBot(botId: string, userId: string | undefined) {
        if (!userId) {
            this.logger.error(`User not found for bot ${botId}`);
            return;
        }

        if (this.activeBots.has(botId)) {
            this.logger.warn(`Bot ${botId} is already running`);
            return;
        }

        const controller = new AbortController();
        this.activeBots.set(botId, controller);

        // Запускаем цикл БЕЗ await, чтобы метод контроллера завершился сразу,
        // но передаем сигнал для возможности остановки
        this.runBotLoop(botId, userId, controller.signal).catch((err) => {
            this.logger.error(`Bot ${botId} crashed:`, err);
            this.stopBot(botId);
        });

        this.logger.log(`Bot ${botId} started for user ${userId}`);
    }

    stopBot(botId: string) {
        const controller = this.activeBots.get(botId);
        if (controller) {
            controller.abort(); // Посылаем сигнал остановки
            this.activeBots.delete(botId);
            this.logger.log(`Bot ${botId} stopped signal sent`);
        }
    }

    // Сама логика "бесконечного" цикла
    private async runBotLoop(
        botId: string,
        userId: string,
        signal: AbortSignal
    ) {
        this.logger.log(`Loop started for bot ${botId}`);

        while (!signal.aborted) {
            try {
                // 1. Имитация полезной работы (запрос к бирже, расчет сетки)
                const price = 60000 + Math.random() * 1000;

                // 2. Отправка логов через WebSocket (только тем, кто смотрит этого бота)
                const payload = {
                    userId,
                    botId,
                    price: price.toFixed(2),
                    message: `Check grid status... OK`,
                    timestamp: new Date().toISOString(),
                };

                // 1. Отправляем в комнату конкретного бота
                this.botGateway.server
                    .to(`bot_${botId}`)
                    .emit('botLog', payload);

                // 2. ТЕСТОВЫЙ: Отправляем в общую комнату
                this.botGateway.server
                    .to('all_bots_logs')
                    .emit('globalLog', payload);

                // 3. ПАУЗА. Обязательно, чтобы не забить CPU!
                // Используем вспомогательную функцию, которая умеет прерываться
                await this.sleep(5000, signal);
            } catch (err) {
                if (signal.aborted) break; // Если прервали во время сна
                this.logger.error(`Error in bot ${botId} loop: ${err}`);
                // Можно добавить логику переподключения или подождать чуть дольше
                await this.sleep(10000, signal);
            }
        }

        this.logger.log(`Loop finished for bot ${botId}`);
        // Здесь можно обновить статус в БД на STOPPED
    }

    // Улучшенный sleep, который мгновенно просыпается при abort()
    private sleep(ms: number, signal: AbortSignal) {
        return new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms);
            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                resolve(null);
            });
        });
    }

    // Остановить всех ботов при выключении сервера
    onModuleDestroy() {
        for (const botId of this.activeBots.keys()) {
            this.stopBot(botId);
        }
    }
}

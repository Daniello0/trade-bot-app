import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    // Состояние для хранения последнего сообщения (опционально)
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        const socketInstance = io(backendUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from server');
        });

        // Универсальный слушатель для отладки или общих уведомлений
        socketInstance.on('botUpdate', (data: any) => {
            setLastMessage(data);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Функция для отправки данных (уже была)
    const sendMessage = useCallback((event: string, data: any) => {
        if (socket) {
            socket.emit(event, data);
        }
    }, [socket]);

    // НОВАЯ ФУНКЦИЯ: Позволяет компоненту подписаться на любое событие
    const subscribe = useCallback((event: string, callback: (data: any) => void) => {
        if (!socket) return;

        socket.on(event, callback);

        // Возвращаем функцию отписки
        return () => {
            socket.off(event, callback);
        };
    }, [socket]);

    return { socket, isConnected, sendMessage, subscribe, lastMessage };
};
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
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

        socketInstance.on('botUpdate', (data: any) => {
            setLastMessage(data);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const sendMessage = useCallback((event: string, data: any) => {
        if (socket) {
            socket.emit(event, data);
        }
    }, [socket]);

    const subscribe = useCallback((event: string, callback: (data: any) => void) => {
        if (!socket) return;

        socket.on(event, callback);

        return () => {
            socket.off(event, callback);
        };
    }, [socket]);

    return { socket, isConnected, sendMessage, subscribe, lastMessage };
};
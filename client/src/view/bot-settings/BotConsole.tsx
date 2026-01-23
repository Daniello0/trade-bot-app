import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import './BotConsole.css';

export const BotConsole: React.FC = () => {
    const { botId, botName } = useParams<{ botId: string, botName: string }>();

    const navigate = useNavigate();
    const { socket } = useSocket();
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (!socket || !botId) return;

        socket.emit('watchBot', { botId });

        socket.on('botLog', (newLog) => {
            setLogs((prev) => [...prev, newLog]);
        });

        return () => {
            socket.off('botLog');
        };
    }, [socket, botId]);

    return (
        <div className="App">
            <div className="console-container">
                <div className="console-header-row">
                    <button className="action-button secondary" onClick={() => navigate(-1)}>
                        Назад
                    </button>
                    <div className="console-title">
                        Консоль бота: <span className="bot-id-text">{botName}</span>
                    </div>
                </div>

                <div className="console-window">
                    <div className="console-content">
                        {logs.length === 0 && (
                            <div className="console-placeholder">Ожидание данных от бота...</div>
                        )}
                        {logs.map((log, index) => (
                            <div key={index} className="log-line">
                                <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="log-price">{log.price} USDT</span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="action-button danger clear-btn" onClick={() => setLogs([])}>
                    Очистить консоль
                </button>
            </div>
        </div>
    );
};
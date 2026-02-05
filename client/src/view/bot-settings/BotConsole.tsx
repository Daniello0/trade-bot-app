import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import './BotConsole.css';
import {Log} from "../../api/Types";

export const BotConsole: React.FC = () => {
    const { botId, botName } = useParams<{ botId: string, botName: string }>();

    const navigate = useNavigate();
    const { socket } = useSocket();
    const [logs, setLogs] = useState<Log[]>([]);

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
                                <span className="log-time">
                                    [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '---'}]
                                </span>
                                <span className="log-price">
                                    {log.price ? Number(log.price).toFixed(4) : '---'} {log.symbol}
                                </span>
                                <span className="log-message">
                                    {log.message}
                                </span>
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
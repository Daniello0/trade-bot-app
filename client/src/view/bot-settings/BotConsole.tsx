import React, {RefObject, useEffect, useRef, useState} from 'react';
import {NavigateFunction, useNavigate, useParams} from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import './BotConsole.css';
import {Log} from "../../api/Types";

export const BotConsole: React.FC = () => {
    const { botId, botName } = useParams<{ botId: string, botName: string }>();

    const navigate: NavigateFunction = useNavigate();
    const socket = useSocket();
    const [logs, setLogs] = useState<Log[]>([]);

    const messagesEndRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [autoScroll, setAutoScroll] = useState<boolean>(true);

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [autoScroll, logs]);

    useEffect(() => {
        if (!socket || !botId) return;

        socket.emit('watchBot', { botId });

        socket.on('botLog', (newLog: Log) => {
            setLogs((prev: Log[]) => [...prev, newLog]);
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
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="button-container">
                    <button className="action-button danger clear-btn" onClick={() => setLogs([])}>
                        Очистить консоль
                    </button>

                    <button className={`action-button ${autoScroll? 'success' : 'danger'} auto-scroll`}
                            onClick={() => {setAutoScroll(!autoScroll)}}>
                        Авто-скроллинг
                    </button>
                </div>
            </div>
        </div>
    );
};
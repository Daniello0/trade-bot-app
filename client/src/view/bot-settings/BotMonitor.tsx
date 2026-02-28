import React, {useState, useEffect, useRef, RefObject} from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import './BotMonitor.css';
import './BotSettings.css';
import {Log, Order, ReadBotDetails, RuntimeState} from "../../api/Types";
import {getBot} from "../../service/BotService";
import {useBotActions} from "../../context/BotActionsContext";
import {deepMerge} from "../../utils/DeepMerge";

export const BotMonitor: React.FC = () => {
    const { botId } = useParams<{ botId: string }>();
    const navigate = useNavigate();
    const socket = useSocket();
    const [bot, setBot] = useState<ReadBotDetails | null>(null);
    const { handleToggleBot } = useBotActions();

    const messagesEndRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [autoScroll, setAutoScroll] = useState<boolean>(true);

    console.log(bot)

    const [logs, setLogs] = useState<Log[]>([]);
    const [dynamicData, setDynamicData] = useState<RuntimeState>({
        currentPrice: 0,
        lowerBound: 0,
        upperBound: 0,
        step: 0,
        sellOrders: [],
        buyOrders: [],
        queue: [],
        messages: []
    });

    const staticData = {
        deposit: bot?.deposit,
        pair: bot?.spotGridSettings?.crypto,
        levels: bot?.spotGridSettings?.levelsSettings.countStatic,
        betSize: bot?.spotGridSettings?.levelsSettings.pricePerBetStatic,
        timeframe: bot?.spotGridSettings?.candleLength,
        lowerBoundDynamic: bot?.spotGridSettings?.gridSettings.lowerBoundDynamic,
        upperBoundDynamic: bot?.spotGridSettings?.gridSettings.upperBoundDynamic,
    };

    const updateBot = async () => {
        if (botId) {
            const botToEdit: ReadBotDetails = await getBot(parseInt(botId));
            setBot(botToEdit);
        }
    }

    const updateDataAndLogs = (patch: Partial<RuntimeState>): void => {
        setDynamicData((prev: RuntimeState) => deepMerge(prev, patch));
        if (patch.messages && patch.messages.length > 0) {
            const newLog: Log = {
                timestamp: new Date().toISOString(),
                price: patch.currentPrice || dynamicData.currentPrice || 0,
                message: patch.messages.join('\n'),
            };
            setLogs((prev: Log[]) => [...prev, newLog]);
        }
    }

    useEffect(() => {
        (async () => {
            await updateBot();
        })()
    }, []);

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [autoScroll, logs]);

    useEffect(() => {
        if (!socket || !botId) return;
        socket.emit('watchBot', { botId });
        socket.on("botState", (patch: Partial<RuntimeState>) => {
            updateDataAndLogs(patch);
        });
        return () => { socket.off('botState'); };
    }, [socket, botId]);

    if (!bot) {
        return <div></div>;
    }

    const handleToggleBotButtonClick = async (botId: number) => {
        const toggleResult: boolean = await handleToggleBot(botId);
        if (toggleResult) await updateBot()
    };

    return (
        <div className="App">
            <div className="dashboard-container">

                <div className="console-header-row">
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <button className="action-button secondary" onClick={() => navigate(-1)}>Назад</button>
                        <div className="console-title">
                            {bot.name}
                            <span className={`status-badge ${bot.status === 'running' ? 'status-running' : 'status-stopped'}`}>
                                {bot.status === 'running' ? 'Запущен' : 'Остановлен'}
                            </span>
                        </div>
                    </div>
                    <div className="button-container" style={{margin: 0}}>
                        <button className="action-button" onClick={() => navigate(`/edit-bot/${botId}`)}>Редактировать</button>
                        <button className={`action-button ${bot.status === 'running' ? 'danger' : 'success'}`}
                                onClick={() => handleToggleBotButtonClick(bot.id)}>
                            {bot.status === 'running' ? 'Стоп' : 'Пуск'}
                        </button>
                    </div>
                </div>

                <div className="dashboard-main-layout">

                    <div className="dynamic-content">

                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-label">Текущая цена</div>
                                <div className="metric-value highlight">{dynamicData.currentPrice+"$"}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Нижняя граница</div>
                                <div className="metric-value">{dynamicData.lowerBound+"$"}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Верхняя граница</div>
                                <div className="metric-value">{dynamicData.upperBound+"$"}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Шаг сетки</div>
                                <div className="metric-value">{dynamicData.step+"$"}</div>
                            </div>
                        </div>

                        <div className="orders-section">
                            <div className="orders-column">
                                <h4 className="sell-header">SELL Ордеры</h4>
                                <table className="mini-table">
                                    <thead><tr><th>Цена</th><th>Qty</th><th>Сумма</th></tr></thead>
                                    <tbody>
                                    {dynamicData.sellOrders?.map((o: Order, i: number) => (
                                        <tr key={i}><td>{o.price+"$"}</td><td>{o.qty}</td><td>{o.total+"$"}</td></tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="orders-column">
                                <h4 className="buy-header">BUY Ордеры</h4>
                                <table className="mini-table">
                                    <thead><tr><th>Цена</th><th>Qty</th><th>Сумма</th></tr></thead>
                                    <tbody>
                                    {dynamicData.buyOrders?.map((o: Order, i: number) => (
                                        <tr key={i}><td>{o.price+"$"}</td><td>{o.qty}</td><td>{o.total+"$"}</td></tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="orders-column">
                                <h4 className="queue-header">В очереди</h4>
                                <table className="mini-table">
                                    <thead><tr><th>Цена</th><th>Qty</th><th>Сумма</th></tr></thead>
                                    <tbody>
                                    {dynamicData.queue?.map((o: Order, i: number) => (
                                        <tr key={i}><td>{o.price+"$"}</td><td>{o.qty}</td><td>{o.total+"$"}</td></tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <aside className="static-sidebar">
                        <div className="sidebar-title">Конфигурация</div>
                        <div className="static-item">
                            <span className="static-label">Депозит:</span>
                            <span className="static-value">{staticData.deposit+"$"}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Валюта:</span>
                            <span className="static-value">{staticData.pair}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Уровней:</span>
                            <span className="static-value">{staticData.levels}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Ставка:</span>
                            <span className="static-value">{staticData.betSize+"$"}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Таймфрейм:</span>
                            <span className="static-value">{staticData.timeframe+" минут"}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Нижняя граница:</span>
                            <span className="static-value">{staticData.lowerBoundDynamic}</span>
                        </div>
                        <div className="static-item">
                            <span className="static-label">Верхняя граница:</span>
                            <span className="static-value">{staticData.upperBoundDynamic}</span>
                        </div>
                    </aside>
                </div>

                <div className="console-section">
                    <div className="console-window mini">
                        <div className="console-content">
                            {logs.length === 0 && (
                                <div className="console-placeholder">Ожидание данных от бота...</div>
                            )}
                            {logs.map((log, index) => (
                                <div key={index} className="log-line">
                                    <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className="log-message">{log.message}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
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
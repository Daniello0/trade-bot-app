import React, { useState, useEffect } from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {UserKeys, ReadBotSummary} from "../../api/Types";
import {createUserKeys, getUserKeys} from "../../service/UserService";
import {ApiKeysModal} from "../bot_settings/ApiKeysModal";
import {toggleBot} from "../../service/BotManagerService";

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [data, setData] = useState<any>(null);
    const [sortedData, setSortedData] = useState<any>(null);
    const navigate: NavigateFunction = useNavigate();

    const [isKeysModalOpen, setKeysModalOpen] = useState(false);
    const [existingKeys, setExistingKeys] = useState<UserKeys | undefined>();

    useEffect(() => {
        (async () => {
            const backendHost = process.env.REACT_APP_BACKEND_HOST;
            const backendPort = process.env.REACT_APP_BACKEND_PORT;
            const backendUrl = `${backendHost}:${backendPort}`;
            const checkConnection = async () => {
                try {
                    const response: Response = await fetch(`${backendUrl}/healthz`, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    console.log(response);

                    if (response.ok) {
                        setData(await getAllBots());
                        setStatus('connected');
                    } else {
                        setStatus('disconnected');
                    }
                } catch (error) {
                    console.error("Connection failed:", error);
                    setStatus('disconnected');
                }
            };
            await checkConnection();
        })()
    }, []);

    const handleToggleBotButtonClick = async (botId: number) => {
        await toggleBot(botId);
        setData(await getAllBots());
    };

    const handleDeleteButtonClick = async (botId: number) => {
        await deleteBot(botId);
        setData(await getAllBots());
    }

    const handleEditButtonClick = (botId: number) => {
        navigate(`/edit-bot/${botId}`);
    }

    const handleSettingsButtonClick = async () => {
        try {
            const keys = await getUserKeys();
            setExistingKeys(keys);
            setKeysModalOpen(true);
        } catch (error) {
            alert('Ошибка! Не удалось загрузить текущие ключи');
        }
    };

    const handleConsoleButtonClick = (botId: number, botName: string) => {
        navigate(`/console/${botId}/${botName}`);
    }

    const handleSaveKeys = async (keys: UserKeys) => {
        try {
            await createUserKeys(keys);
            setKeysModalOpen(false);
        } catch (error) {
            alert('Ошибка! Не удалось сохранить ключи');
        }
    };

    useEffect(() => {
        if (!data) return;

        setSortedData(data.sort((a: { id: number; }, b: { id: number; }) => (a.id < b.id ? 1 : -1)))
    }, [data]);

    if (status === 'connected' && sortedData) {
        return (
            <div className="App">
                <div className="header">
                    <div className="settings" onClick={() => handleSettingsButtonClick()}>Settings</div>
                    <div className="singup" onClick={() => {
                        alert('Зарегистрироваться')
                    }}>Sing up</div>
                    <div className="login" onClick={() => {
                        alert('Войти')
                    }}>Log in</div>
                </div>
                <div className="table">
                    <div className="table-header">
                        <div className="header-column-name">Имя</div>
                        <div className="header-column-type">Тип</div>
                        <div className="header-column-status">Статус</div>
                        <div className="header-column-actions">Действия</div>
                    </div>
                    <div className="table-data">
                        {sortedData.map((bot: ReadBotSummary) => (
                            <div className="table-row" key={bot.id}>
                                <div className="column-name">{bot.name}</div>
                                <div className="column-type">{bot.botType}</div>
                                <div className="column-status">
                                    <span className={`status-badge ${bot.status === 'running' ? 'status-running' : 'status-stopped'}`}>
                                        {bot.status}
                                    </span>
                                </div>
                                <div className="column-actions">
                                    <button className="action-button"
                                            onClick={() => handleConsoleButtonClick(bot.id, bot.name)}>Консоль</button>
                                    <button className="action-button secondary"
                                    onClick={() => handleEditButtonClick(bot.id)}>Редактировать</button>
                                    <button className="action-button danger"
                                            onClick={() => handleDeleteButtonClick(bot.id)}>Удалить</button>
                                    <button
                                        className={`action-button ${bot.status === 'running' ? 'danger' : 'success'}`}
                                        onClick={() => handleToggleBotButtonClick(bot.id)}
                                    >
                                        {bot.status === 'stopped' ? "Пуск" : "Стоп"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="add-bot-button" onClick={() => {navigate('/add-bot')}}>Добавить бота</div>
                <ApiKeysModal
                    isOpen={isKeysModalOpen}
                    onClose={() => setKeysModalOpen(false)}
                    onSave={handleSaveKeys}
                    initialData={existingKeys}
                />
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

export default App;
import React, { useState, useEffect } from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {UserKeys, ReadBotSummary} from "../../api/Types";
import {createUserKeys, getUserKeys} from "../../service/UserKeysService";
import {ApiKeysModal} from "./ApiKeysModal";
import {toggleBot} from "../../service/BotManagerService";
import {requestApi} from "../../service/RequestApiService";
import {AuthModal} from "./AuthModal";

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [data, setData] = useState<any>(null);
    const [sortedData, setSortedData] = useState<any>(null);
    const navigate: NavigateFunction = useNavigate();

    const [isKeysModalOpen, setKeysModalOpen] = useState(false);
    const [existingKeys, setExistingKeys] = useState<UserKeys | undefined>();

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authError, setAuthError] = useState('');

    const checkConnection = async () => {
        try {
            const res: Response = await requestApi('/healthz', 'GET');

            if (res.ok) {
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

    useEffect(() => {
        (async () => {
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

    const handleAuthButtonClick = () => {
        setAuthModalOpen(true);
    }

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
                    <div className="login" onClick={() => handleAuthButtonClick()
                    }>Log in</div>
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
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    // onSave={}
                    // initialData={}
                />
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

export default App;
import React, { useState, useEffect } from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {UserKeys, ReadBotSummary, ReadUser} from "../../api/Types";
import {createUserKeys, getUserKeys} from "../../service/UserKeysService";
import {ApiKeysModal} from "./ApiKeysModal";
import {toggleBot} from "../../service/BotManagerService";
import {requestApi} from "../../service/RequestApiService";
import {AuthModal} from "./AuthModal";

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [data, setData] = useState<ReadBotSummary[] | []>([]);
    const [sortedData, setSortedData] = useState<any>(null);
    const navigate: NavigateFunction = useNavigate();

    const [isKeysModalOpen, setKeysModalOpen] = useState(false);
    const [existingKeys, setExistingKeys] = useState<UserKeys | undefined>();

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    const [authorisedUser, setAuthorisedUser] = useState<ReadUser | undefined>(undefined)

    const checkConnection = async () => {
        try {
            const healthz: Response = await requestApi('/healthz', 'GET');

            if (healthz.ok) {
                setStatus('connected');
                const allBots: ReadBotSummary[] | undefined = await getAllBots();
                if (!allBots) setData([])
                else setData(allBots);
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            console.error("Connection failed:", error);
            setStatus('disconnected');
        }
    };

    const checkAuth = async () => {
        try {
            const user: Response = await requestApi('/user/auth', 'GET');
            if (user.ok) {
                const userObj: ReadUser | undefined = await user.json();
                console.log(userObj);
                setAuthorisedUser(userObj);
            } else {
                setAuthorisedUser(undefined);
                setData([]);
            }
        } catch (error) {
            console.error("Connection failed:", error);
        }
    };

    const refreshAppData = async (): Promise<void> => {
        await checkConnection();
        await checkAuth();
    }

    const unauthorisedRedirect = () => {
        const confirmed: boolean = window.confirm('Необходима авторизация. Желаете продолжить?');
        if (confirmed) setAuthModalOpen(true);
    }

    useEffect(() => {
        (async () => {
            await refreshAppData();
        })()
    }, []);

    const handleToggleBotButtonClick = async (botId: number) => {
        await toggleBot(botId);
        const bots = await getAllBots();
        if (bots) setData(bots);
    };

    const handleDeleteButtonClick = async (botId: number) => {
        await deleteBot(botId);
        const bots = await getAllBots();
        if (bots) setData(bots);
    }

    const handleEditButtonClick = (botId: number) => {
        navigate(`/edit-bot/${botId}`);
    }

    const handleSettingsButtonClick = async () => {
        if (!authorisedUser) {
            unauthorisedRedirect();
            return;
        }
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

    const handleAddBotButtonClick = () => {
        if (!authorisedUser) {
            unauthorisedRedirect();
            return;
        }
        navigate('/add-bot');
    }

    useEffect(() => {
        if (!data) return;

        setSortedData(data.sort((a: { id: number; }, b: { id: number; }) => (a.id < b.id ? 1 : -1)))
    }, [data]);

    if (status === 'connected') {
        return (
            <div className="App">
                <div className="header">
                    <div className="settings" onClick={() => handleSettingsButtonClick()}>Settings</div>
                    <div className="singup" onClick={() => handleAuthButtonClick()}>
                        {authorisedUser? authorisedUser.name : 'Sing up'}
                    </div>
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
                <div className="add-bot-button" onClick={() => handleAddBotButtonClick()}>Добавить бота</div>
                <ApiKeysModal
                    isOpen={isKeysModalOpen}
                    onClose={() => setKeysModalOpen(false)}
                    onSave={handleSaveKeys}
                    initialData={existingKeys}
                />
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    user={authorisedUser}
                    onAuthUpdate={refreshAppData}
                    // onSave={}
                    // initialData={}
                />
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

export default App;
import React, {useState, useEffect, useMemo} from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {UserKeys, ReadBotSummary, ReadUser} from "../../api/Types";
import {createUserKeys, getUserKeys} from "../../service/UserKeysService";
import {ApiKeysModal} from "./ApiKeysModal";
import {toggleBot} from "../../service/BotService";
import {AuthModal} from "./AuthModal";
import {getHealthStatus} from "../../service/HealthzService";
import {getUser} from "../../service/UserAuthService";

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [bots, setBots] = useState<ReadBotSummary[] | []>([]);
    const navigate: NavigateFunction = useNavigate();

    const [isKeysModalOpen, setKeysModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    const [existingKeys, setExistingKeys] = useState<UserKeys | undefined>();

    const [authUser, setAuthUser] = useState<ReadUser | undefined>(undefined)

    const refreshAppData = async () => {
        const [isConnected, user] = await Promise.all([
            getHealthStatus(),
            getUser()
        ]);

        if (isConnected) {
            setStatus('connected');
            if (user) {
                const allBots: ReadBotSummary[] | undefined = await getAllBots();
                setBots(allBots || []);
            }
        } else {
            setStatus('disconnected');
        }

        if (user) {
            setAuthUser(user)
        } else {
            setAuthUser(undefined);
            // hack: removes bots after logout
            setBots([]);
        }
    };

    useEffect(() => {
        (async () => {
            await refreshAppData();
        })()
    }, []);

    const unauthorisedRedirect = () => {
        const confirmed: boolean = window.confirm('Необходима авторизация. Желаете продолжить?');
        if (confirmed) setAuthModalOpen(true);
    }

    const handleToggleBotButtonClick = async (botId: number) => {
        await toggleBot(botId);
        const bots = await getAllBots();
        if (bots) setBots(bots);
    };

    const handleDeleteButtonClick = async (botId: number) => {
        await deleteBot(botId);
        const bots = await getAllBots();
        if (bots) setBots(bots);
    }

    const handleSettingsButtonClick = async () => {
        if (!authUser) {
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

    const handleSaveKeys = async (keys: UserKeys) => {
        try {
            await createUserKeys(keys);
            setKeysModalOpen(false);
        } catch (error) {
            alert('Ошибка! Не удалось сохранить ключи');
        }
    };

    const handleAddBotButtonClick = () => {
        if (!authUser) {
            unauthorisedRedirect();
            return;
        }
        navigate('/add-bot');
    }

    const sortedBots = useMemo(() => {
        return [...bots].sort((a, b) => b.id - a.id);
    }, [bots]);

    if (status === 'connected') {
        return (
            <div className="App">
                <div className="header">
                    <div className="settings" onClick={() => handleSettingsButtonClick()}>Settings</div>
                    <div className="singup" onClick={() => {setAuthModalOpen(true)}}>
                        {authUser? authUser.name : 'Sing up'}
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
                        {sortedBots.map((bot: ReadBotSummary) => (
                            <BotRow
                                key={bot.id}
                                bot={bot}
                                onDelete={() => handleDeleteButtonClick(bot.id)}
                                onToggle={() => handleToggleBotButtonClick(bot.id)}
                                onEdit={() => navigate(`/edit-bot/${bot.id}`)}
                                onConsole={() => navigate(`/console/${bot.id}/${bot.name}`)}
                            />
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
                    user={authUser}
                    onAuthUpdate={refreshAppData}
                />
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

// hack: any type
const BotRow = ({ bot, onDelete, onToggle, onEdit, onConsole }: any) => (
    <div className="table-row">
        <div className="column-name">{bot.name}</div>
        <div className="column-type">{bot.botType}</div>
        <div className="column-status">
            <span className={`status-badge ${bot.status === 'running' ? 'status-running' : 'status-stopped'}`}>
                {bot.status}
            </span>
        </div>
        <div className="column-actions">
            <button className="action-button" onClick={onConsole}>Консоль</button>
            <button className="action-button secondary" onClick={onEdit}>Редактировать</button>
            <button className="action-button danger" onClick={onDelete}>Удалить</button>
            <button
                className={`action-button ${bot.status === 'running' ? 'danger' : 'success'}`}
                onClick={onToggle}
            >
                {bot.status === 'stopped' ? "Пуск" : "Стоп"}
            </button>
        </div>
    </div>
);

export default App;
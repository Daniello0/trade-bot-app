import React, {useState, useEffect, useMemo} from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {ReadBotSummary, ReadUser} from "../../api/Types";
import {AuthModal} from "./AuthModal";
import {getHealthStatus} from "../../service/HealthzService";
import {getUser} from "../../service/UserAuthService";
import {useBotActions} from "../../context/BotActionsContext";

interface BotRowProps {
    bot: ReadBotSummary;
    onDelete: () => void;
    onToggle: () => void;
    onEdit: () => void;
    onConsole: () => void;
}

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const { handleToggleBot, openKeysModal } = useBotActions();
    const [bots, setBots] = useState<ReadBotSummary[] | []>([]);
    const navigate: NavigateFunction = useNavigate();

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

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
            setBots([]);
        }
    };

    useEffect(() => {
        (async () => {
            await refreshAppData();
        })()
    }, []);

    const unauthorisedRedirect = () => {
        const confirmed: boolean =
            window.confirm('Необходима авторизация. Желаете продолжить?');
        if (confirmed) setAuthModalOpen(true);
    }

    const handleToggleBotButtonClick = async (botId: number) => {
        const toggleResult: boolean = await handleToggleBot(botId);
        if (toggleResult) {
            const bots: ReadBotSummary[] | undefined = await getAllBots();
            if (bots) setBots(bots);
        }
    };

    const handleDeleteButtonClick = async (botId: number) => {
        await deleteBot(botId);
        const bots: ReadBotSummary[] | undefined = await getAllBots();
        if (bots) setBots(bots);
    }

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
                    <div className="settings" onClick={openKeysModal}>Настройки API-ключей</div>
                    <div className="singup" onClick={() => {setAuthModalOpen(true)}}>
                        {authUser? authUser.name : 'Войти'}
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
                                onConsole={() => navigate(`/console/${bot.id}`)}
                            />
                        ))}
                    </div>
                </div>
                <div className="add-bot-button" onClick={() => handleAddBotButtonClick()}>Добавить бота</div>
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    user={authUser}
                    onAuthUpdate={refreshAppData}
                />
            </div>
        )
    }

    return <h1> </h1>;
}

const botTypeLabels: Record<string, string> = {
    spotGrid: 'Сеточный бот',
    fullSpot: 'Биржевой бот'
};

const BotRow: React.FC<BotRowProps> = ({ bot, onDelete, onToggle, onEdit, onConsole }: BotRowProps) => (
    <div className="table-row">
        <div className="column-name">{bot.name}</div>
        <div className="column-type">{botTypeLabels[bot.botType]}</div>
        <div className="column-status">
            <span className={`status-badge ${bot.status === 'running' ? 'status-running' : 'status-stopped'}`}>
                {bot.status === 'running' ? 'Запущен' : 'Остановлен'}
            </span>
        </div>
        <div className="column-actions">
            <button className="action-button" onClick={onConsole}>Мониторинг</button>
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
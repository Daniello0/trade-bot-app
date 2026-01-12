import React, { useState, useEffect } from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"
import {deleteBot, getAllBots} from "../../service/BotService";
import {UserKeys, ReadBotSummary} from "../../api/Types";
import {openApiKeysModal} from "../../service/SwalService";
import {createUserKeys} from "../../service/UserService";

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [data, setData] = useState<any>(null);
    const navigate: NavigateFunction = useNavigate();

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

    const handleDeleteButtonClick = async (botId: number) => {
        await deleteBot(botId);
        setData(await getAllBots());
    }

    const handleEditButtonClick = (botId: number) => {
        navigate(`/edit-bot/${botId}`);
    }

    const handleSettingsButtonClick = async () => {
        const keys: UserKeys | undefined = await openApiKeysModal();

        if (!keys) {
            return;
        }

        const error: Error | undefined = await createUserKeys(keys);
        if (error) {
            alert(error.message);
            return;
        }
    }

    if (status === 'connected' && data) {
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
                        {data.map((bot: ReadBotSummary) => (
                            <div className="table-row" key={bot.id}>
                                <div className="column-name">{bot.name}</div>
                                <div className="column-type">{bot.botType}</div>
                                <div className="column-status">
                                    <span className="status-badge status-stopped">disabled</span>
                                </div>
                                <div className="column-actions">
                                    <button className="action-button">Консоль</button>
                                    <button className="action-button secondary"
                                    onClick={() => handleEditButtonClick(bot.id)} >Редактировать</button>
                                    <button className="action-button danger"
                                            onClick={() => handleDeleteButtonClick(bot.id)}>Удалить</button>
                                    <button className="action-button success">Пуск</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="add-bot-button" onClick={() => {navigate('/add-bot')}}>Добавить бота</div>
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

export default App;
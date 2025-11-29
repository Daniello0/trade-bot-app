import React, { useState, useEffect } from 'react';
import './App.css';
import {NavigateFunction} from "react-router";
import {useNavigate} from "react-router"

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
                        const responseData: string = await response.text();
                        setData(responseData);
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

    if (status === 'connected') {
        return (
            <div className="App">
                <div className="header">
                    <div className="settings" onClick={() => {
                        alert('Настройки')
                    }}>Settings</div>
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
                        <div className="table-row">
                            <div className="column-name">Bot1</div>
                            <div className="column-type">Spot Grid Bot</div>
                            <div className="column-status">
                                <span className="status-badge status-stopped">disabled</span>
                            </div>
                            <div className="column-actions">
                                <button className="action-button">Консоль</button>
                                <button className="action-button secondary">Редактировать</button>
                                <button className="action-button danger">Удалить</button>
                                <button className="action-button success">Пуск</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="add-bot-button" onClick={() => {navigate('/add-bot')}}>Добавить бота</div>
            </div>
        )
    }

    return <h1>Disconnected</h1>;
}

export default App;
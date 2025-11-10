import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        const backendPort = process.env.REACT_APP_BACKEND_PORT;
        const backendUrl = `${backendHost}:${backendPort}`;
        const checkConnection = async () => {
            try {
                const response: Response = await fetch(`${backendUrl}/healthz`);

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
        checkConnection();
    }, []);

    if (status === 'loading') {
        return <h1>Loading...</h1>;
    }

    if (status === 'connected') {
        return <h1>Connected: {data}</h1>;
    }

    return <h1>Disconnected</h1>;
}

export default App;

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const toggleBot = async (botId: number) => {
    try {
        await requestApi(`/bots/${botId}/toggle`, 'POST');
    } catch (error) {
        console.error(error);
    }
}

const requestApi = async (endpoint: string, method: string, body?: any) => {
    if (method === 'POST' || method === 'PATCH') {
        return await fetch(backendUrl + `${endpoint}`, {
            method: method,
            credentials: 'include',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } else {
        throw new Error('Не удалось выполнить запрос');
    }
}
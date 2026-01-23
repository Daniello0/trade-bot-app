const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const requestApi = async (endpoint: string, method: string, body?: any) => {
    if (method === 'POST' || method === 'PATCH') {
        return await fetch(backendUrl + `${endpoint}`, {
            method: method,
            credentials: 'include',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } else if (method === 'GET') {
        return await fetch(backendUrl + `${endpoint}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } else if (method === 'DELETE') {
        return await fetch(backendUrl + `${endpoint}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    } else {
        throw new Error('Не удалось выполнить запрос');
    }
}
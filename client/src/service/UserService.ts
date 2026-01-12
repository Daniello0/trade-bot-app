import {UserKeys} from "../api/Types";

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const createUserKeys = async (keys: UserKeys):
    Promise<Error | undefined> => {
    try {
        const res = await requestApi('/user/keys', 'POST', keys);
        if (!res.ok) {
            return new Error('Не удалось сохранить ключи');
        }
    } catch (error) {
        return new Error(`Ошибка при сохранении ключей: ${error}`);
    }
}

export const getUserKeys = async ():
    Promise<UserKeys | undefined> => {
    try {
        const res = await requestApi('/user/keys', 'GET');
        if (res.ok) {
            return await res.json() as UserKeys;
        } else {
            console.error('Ошибка при получении ключей');
            return;
        }

    } catch (error) {
        throw new Error(`Ошибка при получении ключей: ${error}`);
    }
}

const requestApi = async (endpoint: string, method: string, body?: any) => {
    if (method === 'POST') {
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
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } else {
        throw new Error('Не удалось выполнить запрос');
    }
}
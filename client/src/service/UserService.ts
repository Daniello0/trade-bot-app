import {UserKeys} from "../api/Types";

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const createUserKeys = async (keys: UserKeys):
    Promise<Error | undefined> => {
    try {
        const res = await fetch(backendUrl + '/user/keys', {
            method: 'POST',
            body: JSON.stringify(keys),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

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
        const res = await fetch(backendUrl + '/user/keys', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

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
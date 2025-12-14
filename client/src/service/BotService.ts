import {CreateBot} from "../api/Types";

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const createBot = async (botParams: CreateBot): Promise<Error | undefined> => {
    try {
        const res = await fetch(backendUrl + '/bots/create', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(botParams),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.status === 500) {
            return new Error('Ошибка при создании бота');
        }

    } catch (error) {
        return new Error('Ошибка при создании бота');
    }
}

export const getAllBots = async () => {
    try {
        const res = await fetch(backendUrl + '/bots/all', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.error(error);
        return;
    }
}

export const getBot = async (botId: number) => {
    try {
        const res = await fetch(backendUrl + `/bots/${botId}/details`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.ok) {
            return await res.json();
        }

    } catch (error) {
        return new Error('Ошибка при получении деталей бота');
    }
}

export const deleteBot = async (
    botId: number
): Promise<Error | undefined> => {
    try {
        await fetch(backendUrl + `/bots/${botId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    } catch (error) {
        return new Error('Ошибка при удалении бота');
    }
}

export const updateBot = async (
    botId: number,
    updateBotData: CreateBot
): Promise<Error | undefined> => {
    try {
        await fetch(backendUrl + `/bots/${botId}`, {
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify(updateBotData),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        return new Error('Ошибка при обновлении бота');
    }
}

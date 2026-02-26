import {CreateBot, ReadBotSummary} from "../api/Types";
import {requestApi} from "./RequestApiService";

export const createBot = async (botParams: CreateBot): Promise<Error | undefined> => {
    try {
        const res: Response = await requestApi('/bots/create', 'POST', botParams);

        if (res.status === 409) {
            return new Error('Бот с таким именем уже существует');
        }

        if (!res.ok) {
            return new Error('Ошибка при создании бота');
        }
    } catch (error) {
        return new Error('Ошибка при создании бота');
    }
};


export const getAllBots = async ():
    Promise<ReadBotSummary[] | undefined> => {
    try {
        const res: Response = await requestApi('/bots/all', 'GET');
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
        const res: Response = await requestApi(`/bots/${botId}/details`, 'GET');
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
        await requestApi(`/bots/${botId}`, 'DELETE');
    } catch (error) {
        return new Error('Ошибка при удалении бота');
    }
}

export const updateBot = async (
    botId: number,
    updateBotData: CreateBot
): Promise<Error | undefined> => {
    try {
        const res = await requestApi(`/bots/${botId}`, 'PATCH', updateBotData);
        if (res.status === 409) {
            return new Error('Бот с таким именем уже существует');
        }
    } catch (error) {
        return new Error('Ошибка при обновлении бота');
    }
}

export const toggleBot = async (botId: number) => {
    try {
        await requestApi(`/bots/${botId}/toggle`, 'POST');
    } catch (error) {
        console.error(error);
    }
}
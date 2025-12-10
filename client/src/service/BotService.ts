import {CreateBot} from "../api/Types";

const backendUrl = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const createBot = async (botParams: CreateBot) => {
    try {
        await fetch(backendUrl + '/bots/create', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(botParams),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.error(error);
        return;
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

export const deleteBot = async (botId: number): Promise<void> => {
    try {
        await fetch(backendUrl + `/bots/${botId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    } catch (error) {}
}

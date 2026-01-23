import {requestApi} from "./RequestApiService";

export const toggleBot = async (botId: number) => {
    try {
        await requestApi(`/bots/${botId}/toggle`, 'POST');
    } catch (error) {
        console.error(error);
    }
}
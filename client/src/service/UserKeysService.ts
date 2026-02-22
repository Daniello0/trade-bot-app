import {UserKeys} from "../api/Types";
import {requestApi} from "./RequestApiService";

export const createUserKeys = async (keys: UserKeys):
    Promise<Error | undefined> => {
    try {
        const res: Response = await requestApi('/user/keys', 'POST', keys);
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
        const res: Response = await requestApi('/user/keys', 'GET');
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
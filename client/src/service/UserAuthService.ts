import {requestApi} from "./RequestApiService";

export const loginUser = async (idToken: string) => {
    try {
        const res: Response = await requestApi(`/user/login`, 'POST', idToken);
        if (res.ok) {
            return res.json();
        }
    } catch (error) {
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        const res: Response = await requestApi(`/user/logout`, 'POST');
        if (res.ok) {
            return res.json();
        }
    } catch (error) {
        throw error;
    }
}

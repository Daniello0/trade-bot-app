import {requestApi} from "./RequestApiService";

export const loginUser = async (idToken: string) => {
    try {
        const res: Response = await requestApi(`/user/auth/login`, 'POST', {idToken});
        if (res.ok) {
            return res.status
        }
    } catch (error) {
        throw error;
    }
}

export const logoutUser = async (): Promise<void> => {
    try {
        await requestApi(`/user/auth/logout`, 'POST');
    } catch (error) {
        throw error;
    }
}

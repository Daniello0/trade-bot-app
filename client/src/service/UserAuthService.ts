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

export const logoutUser = async () => {
    try {
        const res: Response = await requestApi(`/user/auth/logout`, 'POST');
        if (res.ok) {
            return res.json();
        }
    } catch (error) {
        throw error;
    }
}

export const auth = async () => {
    try {
        const res: Response = await requestApi(`/user/auth`, 'GET');
        if (res.ok) {
            return res.json();
        }
    } catch (error) {
        throw error;
    }
}

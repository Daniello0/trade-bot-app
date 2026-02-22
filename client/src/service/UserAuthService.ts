import {requestApi} from "./RequestApiService";
import {ReadUser} from "../api/Types";

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

export const getUser = async (): Promise<ReadUser | undefined> => {
    try {
        const user: Response = await requestApi('/user/auth', 'GET');
        if (user.ok) {
            return await user.json();
        }
    } catch (error) {
        console.error("Connection failed:", error);
    }
};

import { requestApi } from "./RequestApiService";

export const getHealthStatus = async (): Promise<boolean> => {
    try {
        const res: Response = await requestApi('/healthz', 'GET');
        return res.ok;
    } catch {
        return false;
    }
};
const BASE_URL = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const requestApi = async (
    endpoint: string,
    method: string,
    body?: any
): Promise<Response> => {
    const config: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    return await fetch(`${BASE_URL}${endpoint}`, config);
};
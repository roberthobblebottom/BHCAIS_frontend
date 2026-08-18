import { useAuthStore } from '../stores/auth.store';


export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')
};

function request(method: string) {
    return (url: string, body: any = null) => {

        const requestOptions: RequestInit = {
            method,
            headers: authHeader(url)
        };

        if (body) {
            requestOptions.headers = { 'Content-Type': 'application/json' }
            requestOptions.body = JSON.stringify(body);
        }
        return fetch(url, requestOptions).then(handleResponse);
    }
}
export const login = (url: string, body: any) => {
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: authHeader(url)
    };
    if (body) {
        const formData = new URLSearchParams();
        Object.keys(body).forEach(key => {
            formData.append(key, body[key]);
        });
        requestOptions.body = formData;
        // Don't set Content-Type as header — browser will set it automatically
    }
    return fetch(url, requestOptions).then(handleResponse);
}


// export const uploadFiles = (url: string, body: any){ 
//     const requestOptions:RequestInit = {
//             method:'POST',
//             headers: authHeader(url)
//         };
//         if (body) {
//             const formData = new URLSearchParams();
//             Object.keys(body).forEach(key => {
//                 formData.append(key, body[key]);
//             });
//             requestOptions.body = formData;
//             // Don't set Content-Type as header — browser will set it automatically
//         }
//         return fetch(url, requestOptions).then(handleResponse);
// }

// helper functions

function authHeader(url: string): HeadersInit {
    // return auth header with jwt if user is logged in and request is to the api url
    const { user } = useAuthStore();
    const isLoggedIn = !!user?.token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
}

function handleResponse(response: Response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const { user, logout } = useAuthStore();
            if ([401, 403].includes(response.status) && user) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                logout();
            }

            const error = data.detail;
            return Promise.reject(error);
        }

        return data;
    });
}
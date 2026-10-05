import { useAuthStore } from '../stores/auth.store'

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')

}

function request(method: string) {
    return (url: string, body: any = null) => {
        const requestOptions: RequestInit = {
            method,
            headers: authHeader(url, {})
        }
        if (body) {
            requestOptions.headers = {
                ...{ 'Content-Type': 'application/json' }, ...requestOptions.headers
            }
            requestOptions.body = JSON.stringify(body)
        }
        return fetch(url, requestOptions).then(handleResponse)
    }
}

export const streamFilesDownload = (url: string, body: any = null) => {
    const requestOptions: RequestInit = {
        method: "POST",
        headers: authHeader(url, {})
    }
    if (body) {
        requestOptions['headers'] = {
            ...{ 'Content-Type': 'application/json' }, ...requestOptions.headers
        }
        requestOptions.body = JSON.stringify(body)
    }

    return fetch(url, requestOptions).then(handleResponseStreaming)

}

//for deletion of user so that it will also fetch the updated version of the login_user table
export const noCacheRequestFunction = (url: string, method: string, body: any = null) => {
    const header: any = { 'Cache-Control': 'no-cache' }
    const requestOptions: RequestInit = {
        method,
        headers: authHeader(url, header)
    }
    if (body) {
        requestOptions.headers = { 'Content-Type': 'application/json' }
        requestOptions.body = JSON.stringify(body)
    }
    return fetch(url, requestOptions).then(handleResponse)
}

export const login = (url: string, body: any) => {
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: authHeader(url, {})
    }
    if (body) {
        const formData = new URLSearchParams()
        Object.keys(body).forEach(key => formData.append(key, body[key]))
        requestOptions.body = formData
        // Don't set Content-Type as header — browser will set it automatically
    }
    return fetch(url, requestOptions).then(handleResponse)
}

export const getTemplatesFiles = async (url: string) => {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: authHeader(url, {})
    }
    const response = await fetch(url, requestOptions)
    return handleResponseForTemplateFiles(response)
}

function authHeader(url: string, header: any): HeadersInit {
    // return auth header with jwt if user is logged in and request is to the api url
    const { user } = useAuthStore()
    const isLoggedIn = !!user?.token
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL)
    if (isLoggedIn && isApiUrl) {
        header['Authorization'] = `Bearer ${user.token}`
        return header
    } else {
        return header
    }
}

function handleResponse(response: Response, isJSON: boolean = true) {
    const statusCode = response.status
    return response.text().then(text => {
        const data = isJSON ? text && JSON.parse(text) : text
        if (!response.ok) {
            const { user, logout } = useAuthStore()
            if ([401, 403].includes(statusCode) && user) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                console.log(statusCode)
                console.log("logging out")
                logout()
            }
            const error = data.details
            return Promise.reject(error)
        }
        return data
    }).catch((err) => console.warn(err))
}
function handleResponseStreaming(response: Response, isJSON: boolean = true) {
    const statusCode = response.status
    const { user, logout } = useAuthStore()
    if (!response.ok && [401].includes(statusCode) && user) {
        console.log(statusCode)
        console.log("logging out")
        logout()
    }
    let reader = null
    try {
        reader = response.body!.getReader()
    }
    catch (err) {
        console.warn(err)
    }
    return reader
}
function handleResponseForTemplateFiles(response: Response) {

    const statusCode = response.status
    return response.blob().then(data => {
        if (!response.ok) {
            const { user, logout } = useAuthStore()
            if ([401, 403].includes(statusCode) && user)
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                logout()

            return Promise.reject('error downloading file(s)')
        }
        return data
    })
}



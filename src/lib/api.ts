import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: `${API_BASE}`,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    err => Promise.reject(err)
)

api.interceptors.response.use(
    resp => resp,
    err => {
        if (err.response?.status === 401) {
            window.location.href = '/auth'
        }
        return Promise.reject(err)
    }
)

export default api

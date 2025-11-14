import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('baseUrl : ' + baseURL);

export const bTeamApi = axios.create({
    baseURL: baseURL
});

bTeamApi.interceptors.request.use(
    config => {
        const token = localStorage.getItem("jwtToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

export default bTeamApi
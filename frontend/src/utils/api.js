import axios from 'axios';

const API = axios.create({
    baseURL: '/api'
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('sn_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('sn_token');
            localStorage.removeItem('sn_admin');
            localStorage.removeItem('sn_role');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default API;

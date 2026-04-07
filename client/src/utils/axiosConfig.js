import axios from 'axios';

export const BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for cookies (JWT)
});

export default api;

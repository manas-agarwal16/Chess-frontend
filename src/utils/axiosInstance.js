import axios from 'axios';
const BACKENDURL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = BACKENDURL;
axiosInstance.defaults.withCredentials = true;

export {axiosInstance};
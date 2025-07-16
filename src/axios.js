import axios from 'axios';

const api = axios.create({
  baseURL:'https://taskmaster-backend-foln.onrender.com/api/',
});
export default api;
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://my-todo-app-6nqa.onrender.com'
});

export default apiClient;
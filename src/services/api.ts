import axios from 'axios';

// API temel URL'si
const API_URL = 'http://localhost:8000';

// Token yönetimi için yerel depolama anahtarı
const TOKEN_KEY = 'auth_token';

// Axios instance'ı
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
  withCredentials: false, // CORS isteklerinde kimlik bilgilerini gönderme
});

// İstek interceptor'u - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'u - hata işleme
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    // Oturum hatalarını geçici olarak devre dışı bırakıyoruz
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem(TOKEN_KEY);
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// API servisleri
export const authService = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/token', formData);
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/categories/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  getProducts: async (id: number) => {
    const response = await api.get(`/categories/${id}/products`);
    return response.data;
  },
};

export const productService = {
  getAll: async () => {
    const response = await api.get('/stock/products/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/stock/products/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/stock/products/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/stock/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/stock/products/${id}`);
    return response.data;
  },
};

export const stockItemService = {
  getAll: async () => {
    const response = await api.get('/stock/items/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/stock/items/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/stock/items/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/stock/items/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/stock/items/${id}`);
    return response.data;
  },
};

export default api;

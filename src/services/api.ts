import axios from 'axios';

// API temel URL'si
const API_URL = 'http://localhost:8001';

// Token yönetimi için yerel depolama anahtarı
const TOKEN_KEY = 'auth_token';

// Axios instance'ı
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 saniye timeout
  withCredentials: false, // CORS isteklerinde kimlik bilgilerini gönderme
});

// İstek interceptor'u - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'u - hata işleme
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      } : null,
      request: error.request || null
    });
    // Oturum hatası durumunda
    if (error.response && error.response.status === 401) {
      // Token ile ilgili sorunlarda token'ı temizle
      if (error.config && !error.config.url?.includes('/auth/token')) {
        localStorage.removeItem(TOKEN_KEY);
        // Token geçersiz ise, kullanıcıyı login sayfasına yönlendir
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API servisleri
export const authService = {
  login: async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      console.log('Login attempt:', { username });
      
      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        console.log('Login successful, token stored');
      } else {
        console.error('Login response missing token:', response.data);
        throw new Error('Geçersiz yanıt: Token bulunamadı');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    console.log('User logged out, token removed');
  },
  
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    console.log('Authentication check:', hasToken);
    return hasToken;
  },
};

export const userService = {
  register: async (userData: any) => {
    try {
      console.log('Registering user:', { 
        username: userData.username, 
        email: userData.email 
      });
      
      // UserCreate şemasındaki alanları doğru şekilde eşleştir
      const userPayload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        is_admin: userData.is_admin !== undefined ? userData.is_admin : false
      };
      
      console.log('Sending user data:', userPayload);
      
      // Kayıt isteğini gönder
      const response = await api.post('/users/register', userPayload);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  getAllUsers: async () => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },
  
  getUserById: async (id: number) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      throw error;
    }
  },
  
  updateUser: async (id: number, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      throw error;
    }
  },
  
  deleteUser: async (id: number) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete user ${id} error:`, error);
      throw error;
    }
  }
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
  getAll: async (params: { skip?: number, limit?: number, category_id?: number, name?: string } = {}) => {
    try {
      const response = await api.get('/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      throw error;
    }
  },
  
  create: async (data: any) => {
    try {
      console.log('Creating product:', data);
      
      // ProductCreate şemasındaki alanları doğru şekilde eşleştir
      const productPayload = {
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        category_id: Number(data.category_id),
        unit_price: Number(data.unit_price)
      };
      
      console.log('Sending product data:', productPayload);
      
      const response = await api.post('/products/', productPayload);
      console.log('Product created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    try {
      const productPayload = {
        name: data.name,
        sku: data.sku,
        description: data.description || '',
        category_id: Number(data.category_id),
        unit_price: Number(data.unit_price)
      };
      
      const response = await api.put(`/products/${id}`, productPayload);
      return response.data;
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      throw error;
    }
  },
  
  getStockItems: async (id: number) => {
    try {
      const response = await api.get(`/products/${id}/stock`);
      return response.data;
    } catch (error) {
      console.error(`Get stock items for product ${id} error:`, error);
      throw error;
    }
  }
};

export const stockItemService = {
  getAll: async (params: { 
    skip?: number, 
    limit?: number, 
    product_id?: number, 
    location?: string,
    low_stock?: boolean,
    expiring_soon?: boolean
  } = {}) => {
    try {
      const response = await api.get('/stock-items/', { params });
      return response.data;
    } catch (error) {
      console.error('Get stock items error:', error);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await api.get(`/stock-items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get stock item ${id} error:`, error);
      throw error;
    }
  },
  
  create: async (data: any) => {
    try {
      console.log('Creating stock item:', data);
      
      // Tarih değerlerini düzenle
      const stockItemPayload = {
        ...data,
        product_id: Number(data.product_id),
        quantity: Number(data.quantity),
        manufacturing_date: data.manufacturing_date ? new Date(data.manufacturing_date).toISOString() : null,
        expiration_date: data.expiration_date ? new Date(data.expiration_date).toISOString() : null
      };
      
      console.log('Sending stock item data:', stockItemPayload);
      
      const response = await api.post('/stock-items/', stockItemPayload);
      return response.data;
    } catch (error) {
      console.error('Create stock item error:', error);
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    try {
      // Tarih değerlerini düzenle
      const stockItemPayload = {
        ...data,
        product_id: Number(data.product_id),
        quantity: Number(data.quantity),
        manufacturing_date: data.manufacturing_date ? new Date(data.manufacturing_date).toISOString() : null,
        expiration_date: data.expiration_date ? new Date(data.expiration_date).toISOString() : null
      };
      
      const response = await api.put(`/stock-items/${id}`, stockItemPayload);
      return response.data;
    } catch (error) {
      console.error(`Update stock item ${id} error:`, error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/stock-items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete stock item ${id} error:`, error);
      throw error;
    }
  },
  
  getExpiringSoonCount: async (days: number = 30) => {
    try {
      const response = await api.get(`/stock-items/analytics/expiring-soon-count`, { params: { days } });
      return response.data.count;
    } catch (error) {
      console.error('Get expiring soon count error:', error);
      throw error;
    }
  },
  
  getLowStockCount: async (threshold: number = 10) => {
    try {
      const response = await api.get(`/stock-items/analytics/low-stock-count`, { params: { threshold } });
      return response.data.count;
    } catch (error) {
      console.error('Get low stock count error:', error);
      throw error;
    }
  }
};

export default api;

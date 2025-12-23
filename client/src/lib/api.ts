// src/lib/api.ts
import axios from 'axios';
import { API_BASE_URL } from '@/const';

// Main axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRITICAL: Fix multipart/form-data uploads
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // const role = localStorage.getItem('role'); // 'admin' أو 'superAdmin'
// const token = localStorage.getItem(role === 'superAdmin' ? 'superAdminToken' : 'token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let browser set correct Content-Type + boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/orders/admin/all-orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  getAdminOrderById:async (orderId: string) => {
 const response = await api.get(`/orders/admin/${orderId}`);
    return response.data;

    // افترض أن ordersAPI يستخدم Axios أو Fetch
    // return axios.get(`/orders/admin/${orderId}`); 
  },
  // getByIdAdmin: (id: string) =>
  // axios.get(`/orders/admin/${id}`)

};

// Coupons API
export const couponsAPI = {
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },
  create: async (couponData: any) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },
  update: async (id: string, couponData: any) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
};
export const promoCodesAPI={
   create: async (couponData: any) => {
    const response = await api.post('/promo', couponData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/promo/${id}`);
    return response.data;
  },
   update: async (id: string, couponData: any) => {
    const response = await api.put(`/promo/${id}`, couponData);
    return response.data;
  },
}

// Statistics API
export const statsAPI = {
  getDashboard: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
};

// HERO IMAGES API — FULLY FIXED FOR FILE UPLOADS
export const heroImagesAPI = {
  getAll: async () => {
    const response = await api.get('/hero-images');
    return response.data;
  },

  // Create with image upload
  create: async (formData: FormData) => {
    const response = await api.post('/hero-images', formData);
    return response.data;
  },

  // Update (supports replacing image)
  update: async (id: string, formData: FormData) => {
    const response = await api.put(`/hero-images/${id}`, formData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/hero-images/${id}`);
    return response.data;
  },
};
export const productImagesAPI = {
  getAll: async () => {
    const response = await api.get('/product-images');
    return response.data;
  },

  // Create with image upload
  create: async (formData: FormData) => {
    const response = await api.post('/product-images', formData);
    return response.data;
  },

  // Update (supports replacing image)
  update: async (id: string, formData: FormData) => {
    const response = await api.put(`/product-images/${id}`, formData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/product-images/${id}`);
    return response.data;
  },
};


// Revenue API (Admin Dashboard)
export const revenueAPI = {
  get: async () => {
    const response = await api.get('/orders/admin/revenue');
    return response.data;
  },
};
// // Statistics API
// export const statsAPI = {
//   getDashboard: async () => {
//     const response = await api.get('/stats/dashboard');
//     return response.data;
//   },
// };

// // HERO IMAGES API — FULLY FIXED FOR FILE UPLOADS
// export const heroImagesAPI = {
//   getAll: async () => {
//     const response = await api.get('/hero-images');
//     return response.data;
//   },

//   // Create with image upload
//   create: async (formData: FormData) => {
//     const response = await api.post('/hero-images', formData);
//     return response.data;
//   },

//   // Update (supports replacing image)
//   update: async (id: string, formData: FormData) => {
//     const response = await api.put(`/hero-images/${id}`, formData);
//     return response.data;
//   },

//   delete: async (id: string) => {
//     const response = await api.delete(`/hero-images/${id}`);
//     return response.data;
//   },
// };




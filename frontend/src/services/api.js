import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/profile/'),
};

// Post APIs
export const postAPI = {
  getPosts: (page = 1) => api.get(`/posts/?page=${page}`),
  getPost: (id) => api.get(`/posts/${id}/`),
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    formData.append('visibility', postData.visibility);
    if (postData.image) {
      formData.append('image', postData.image);
    }
    return api.post('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updatePost: (id, postData) => api.patch(`/posts/${id}/`, postData),
  deletePost: (id) => api.delete(`/posts/${id}/`),
  toggleLike: (id) => api.post(`/posts/${id}/like/`),
};

// Comment APIs
export const commentAPI = {
  getComments: (postId) => api.get(`/posts/${postId}/comments/`),
  createComment: (postId, content, parentId = null) =>
    api.post(`/posts/${postId}/comments/`, { content, parent: parentId }),
  updateComment: (id, content) => api.patch(`/posts/comments/${id}/`, { content }),
  deleteComment: (id) => api.delete(`/posts/comments/${id}/`),
  toggleLike: (id) => api.post(`/posts/comments/${id}/like/`),
};

export default api;

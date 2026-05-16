import axios from 'axios';
import type {
  ApiResponse,
  UserProfile,
  UserUsage,
  FileMeta,
  ConversionJob,
  ConversionFormat,
  ApiKey,
  PaginationParams,
} from '@convertforge/shared-types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

function getSessionId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-session-id'] = getSessionId();
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await api.post('/v1/auth/refresh', { refreshToken });
          const newToken = data.data.accessToken;
          localStorage.setItem('auth_token', newToken);
          localStorage.setItem('refresh_token', data.data.refreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

async function handleResponse<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.success) {
    throw new Error(data.error?.message || 'An error occurred');
  }
  return data.data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    handleResponse<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      api.post('/v1/auth/login', { email, password }),
    ),

  register: (name: string, email: string, password: string) =>
    handleResponse<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      api.post('/v1/auth/register', { name, email, password }),
    ),

  requestOtp: (email: string) =>
    handleResponse<{ message: string }>(api.post('/v1/auth/otp/send', { email })),

  verifyOtp: (email: string, otp: string, name?: string) =>
    handleResponse<{ user: UserProfile; accessToken: string; refreshToken: string }>(
      api.post('/v1/auth/otp/verify', { email, otp, name }),
    ),

  getMe: () => handleResponse<UserProfile>(api.get('/v1/auth/me')),

  refreshToken: (refreshToken: string) =>
    handleResponse<{ accessToken: string; refreshToken: string }>(
      api.post('/v1/auth/refresh', { refreshToken }),
    ),

  updateProfile: (data: Partial<UserProfile>) =>
    handleResponse<UserProfile>(api.patch('/v1/user/profile', data)),
};

export const filesApi = {
  getFiles: (params?: PaginationParams & { search?: string; format?: string; status?: string }) =>
    handleResponse<{ items: FileMeta[]; total: number; totalPages: number }>(
      api.get('/v1/upload/files', { params }),
    ),

  getFile: (id: string) => handleResponse<FileMeta>(api.get(`/v1/upload/${id}`)),

  deleteFile: (id: string) => handleResponse<void>(api.delete(`/v1/upload/files/${id}`)),

  initiateUpload: (fileName: string, fileSize: number, mimeType: string) =>
    handleResponse<{ id: string; uploadUrl?: string; uploadMethod: 'PUT' | 'CHUNKED'; chunkUpload?: any }>(
      api.post('/v1/upload/initiate', { fileName, fileSize, mimeType }),
    ),

  completeChunkedUpload: (fileId: string, uploadId: string) =>
    handleResponse<{ message: string }>(api.post(`/v1/upload/complete/${uploadId}`, { fileId })),

  uploadToUrl: async (uploadUrl: string, file: File | Blob, headers?: Record<string, string>) => {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type, ...headers },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.debug(`Upload progress: ${percent}%`);
        }
      },
    });
  },
};

export const conversionsApi = {
  createConversion: (fileId: string, outputFormat: string, options?: Record<string, unknown>) =>
    handleResponse<{ id: string; status: string; jobId: string }>(
      api.post('/v1/convert', { fileId, outputFormat, options }),
    ),

  getConversions: (params?: PaginationParams) =>
    handleResponse<{ items: ConversionJob[]; total: number; totalPages: number }>(
      api.get('/v1/convert/history', { params }),
    ),

  getConversion: (id: string) =>
    handleResponse<ConversionJob>(api.get(`/v1/convert/${id}`)),

  cancelConversion: (id: string) =>
    handleResponse<{ message: string }>(api.delete(`/v1/convert/${id}`)),

  getFormats: () =>
    handleResponse<{ input: string; outputs: string[] }[]>(api.get('/v1/convert/formats')),
};

export const usageApi = {
  getUsage: () => handleResponse<UserUsage>(api.get('/v1/user/usage')),
};

export const apiKeysApi = {
  getApiKeys: () => handleResponse<ApiKey[]>(api.get('/v1/api-keys')),
  createApiKey: (name: string, expiresInDays?: number) =>
    handleResponse<ApiKey>(api.post('/v1/api-keys', { name, expiresInDays })),
  revokeApiKey: (id: string) => handleResponse<void>(api.post(`/v1/api-keys/${id}/revoke`)),
  deleteApiKey: (id: string) => handleResponse<void>(api.delete(`/v1/api-keys/${id}`)),
};

export const billingApi = {
  getPlans: () => handleResponse<any[]>(api.get('/v1/billing/plans')),
  getSubscription: () => handleResponse<any>(api.get('/v1/billing/subscription')),
  createCheckoutSession: (planId: string) =>
    handleResponse<{ url: string; sessionId: string }>(api.post('/v1/billing/checkout', { planId })),
  createPortalSession: () =>
    handleResponse<{ url: string }>(api.post('/v1/billing/portal')),
};

export default api;

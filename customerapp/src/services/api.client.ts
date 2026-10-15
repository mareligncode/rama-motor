import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api';
import { STORAGE_KEYS } from '../constants/storage';
import { storage } from '../utils/storage';
import { ApiResponse } from '../types/api.types';

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export interface RequestOptions extends AxiosRequestConfig {
  timeoutMs?: number;
}

export class ApiClient {
  public axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor: Inject JWT Bearer Token from AsyncStorage
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (storageError) {
          console.warn('ApiClient: Failed to retrieve auth token from storage', storageError);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Format errors and handle network timeouts
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
          return Promise.reject(
            new ApiError('Network request timed out. Please check your connection.', 408)
          );
        }

        if (error.response) {
          const responseData = error.response.data as any;
          const status = error.response.status;
          const errorMessage =
            responseData?.message ||
            (responseData?.error && typeof responseData.error === 'string'
              ? responseData.error
              : `Request failed with status ${status}`);

          return Promise.reject(new ApiError(errorMessage, status, responseData));
        }

        // Network error (no response received from server)
        return Promise.reject(
          new ApiError(
            error.message || 'Unable to connect to Rama Delivery server. Please check your connection.',
            0,
            error
          )
        );
      }
    );
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.axiosInstance.defaults.baseURL = url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T = any>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { timeoutMs, ...axiosConfig } = options;
    const config: AxiosRequestConfig = {
      ...axiosConfig,
      url: path,
    };

    if (timeoutMs) {
      config.timeout = timeoutMs;
    }

    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Unexpected network error occurred',
        error.statusCode || 500,
        error
      );
    }
  }

  async get<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      data: body,
    });
  }

  async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      data: body,
    });
  }

  async patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      data: body,
    });
  }

  async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

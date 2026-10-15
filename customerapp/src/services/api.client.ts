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

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    return await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${this.baseUrl}${fullPath}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.append(key, String(val));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  async request<T = any>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { timeoutMs = API_TIMEOUT_MS, params, headers: customHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text };
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          (responseData?.error && typeof responseData.error === 'string'
            ? responseData.error
            : `Request failed with status ${response.status}`);

        throw new ApiError(errorMessage, response.status, responseData);
      }

      return responseData as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError('Network request timed out. Please check your connection.', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error.message || 'Unable to connect to Rama Delivery server. Please check your connection.',
        0,
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
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

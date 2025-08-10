/**
 * API client service for making HTTP requests
 */

import { 
  ApiResponse, 
  ApiClientError,
  createFetchConfig,
  handleFetchResponse,
  buildApiUrl,
  retryApiCall,
  handleApiError
} from '../utils/apiUtils';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders
      }
    };
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    return buildApiUrl(this.config.baseURL, path, params);
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      params?: Record<string, any>;
      data?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const { params, data, headers, timeout } = options;
    
    const url = this.buildUrl(path, params);
    const fetchConfig = createFetchConfig({
      method,
      headers: { ...this.config.defaultHeaders, ...headers },
      body: data,
      timeout: timeout || this.config.timeout
    });

    const apiCall = async () => {
      const response = await fetch(url, fetchConfig);
      return handleFetchResponse<T>(response);
    };

    if (this.config.retries > 0) {
      return retryApiCall(apiCall, this.config.retries, this.config.retryDelay);
    }

    return apiCall();
  }

  async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, { params, headers });
  }

  async post<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, { data, headers });
  }

  async put<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, { data, headers });
  }

  async patch<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, { data, headers });
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, { headers });
  }

  // Convenience methods for common API patterns
  async getList<T>(path: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
    [key: string]: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.get(path, params);
  }

  async getById<T>(path: string, id: string | number): Promise<T> {
    return this.get(`${path}/${id}`);
  }

  async create<T>(path: string, data: any): Promise<T> {
    return this.post(path, data);
  }

  async update<T>(path: string, id: string | number, data: any): Promise<T> {
    return this.put(`${path}/${id}`, data);
  }

  async remove(path: string, id: string | number): Promise<void> {
    return this.delete(`${path}/${id}`);
  }

  // Authentication methods
  setAuthToken(token: string) {
    this.config.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.config.defaultHeaders.Authorization;
  }

  // Configuration methods
  setBaseURL(baseURL: string) {
    this.config.baseURL = baseURL;
  }

  setTimeout(timeout: number) {
    this.config.timeout = timeout;
  }

  setDefaultHeader(key: string, value: string) {
    this.config.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string) {
    delete this.config.defaultHeaders[key];
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  baseURL: '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});

// Typed API client for specific domains
export class TypedApiClient<TEntity> extends ApiClient {
  constructor(private entityPath: string, config?: ApiClientConfig) {
    super(config);
  }

  async list(params?: Record<string, any>): Promise<{
    data: TEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getList(this.entityPath, params);
  }

  async getEntity(id: string | number): Promise<TEntity> {
    return this.getById(this.entityPath, id);
  }

  async createEntity(data: Partial<TEntity>): Promise<TEntity> {
    return super.create(this.entityPath, data);
  }

  async updateEntity(id: string | number, data: Partial<TEntity>): Promise<TEntity> {
    return super.update(this.entityPath, id, data);
  }

  async deleteEntity(id: string | number): Promise<void> {
    return this.remove(this.entityPath, id);
  }
}

// Predefined API clients for common entities
export const appointmentsApi = new TypedApiClient<any>('/appointments');
export const customersApi = new TypedApiClient<any>('/customers');
export const staffApi = new TypedApiClient<any>('/staff');
export const profileApi = new TypedApiClient<any>('/profile');
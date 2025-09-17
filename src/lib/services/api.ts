// API service layer for data fetching and mutations
import { z } from 'zod';

// Base API configuration
const API_BASE_URL = '/api';

// Common response types
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Generic API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// Project types and schemas
export const ProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).default('planning'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_amount: z.number().optional(),
  actual_cost: z.number().default(0),
  progress_percentage: z.number().min(0).max(100).default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Contractor types and schemas
export const ContractorSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Contractor name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  specialty: z.string().optional(),
  hourly_rate: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Contractor = z.infer<typeof ContractorSchema>;

// Task types and schemas
export const TaskSchema = z.object({
  id: z.number().optional(),
  project_id: z.number().min(1, 'Project ID is required'),
  contractor_id: z.number().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  estimated_cost: z.number().optional(),
  actual_cost: z.number().optional(),
  due_date: z.string().optional(),
  completed_date: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Project API functions
export const projectApi = {
  // Get all projects
  getAll: (): Promise<Project[]> => 
    apiClient.get<Project[]>('/projects'),

  // Get project by ID
  getById: (id: number): Promise<Project> => 
    apiClient.get<Project>(`/projects/${id}`),

  // Create new project
  create: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => 
    apiClient.post<Project>('/projects', data),

  // Update project
  update: (id: number, data: Partial<Project>): Promise<Project> => 
    apiClient.put<Project>(`/projects/${id}`, data),

  // Partial update project
  patch: (id: number, data: Partial<Project>): Promise<Project> => 
    apiClient.patch<Project>(`/projects/${id}`, data),

  // Delete project
  delete: (id: number): Promise<{ message: string }> => 
    apiClient.delete<{ message: string }>(`/projects/${id}`),
};

// Contractor API functions
export const contractorApi = {
  // Get all contractors
  getAll: (): Promise<Contractor[]> => 
    apiClient.get<Contractor[]>('/contractors'),

  // Get contractor by ID
  getById: (id: number): Promise<Contractor> => 
    apiClient.get<Contractor>(`/contractors/${id}`),

  // Create new contractor
  create: (data: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>): Promise<Contractor> => 
    apiClient.post<Contractor>('/contractors', data),

  // Update contractor
  update: (id: number, data: Partial<Contractor>): Promise<Contractor> => 
    apiClient.put<Contractor>(`/contractors/${id}`, data),

  // Partial update contractor
  patch: (id: number, data: Partial<Contractor>): Promise<Contractor> => 
    apiClient.patch<Contractor>(`/contractors/${id}`, data),

  // Delete contractor
  delete: (id: number): Promise<{ message: string }> => 
    apiClient.delete<{ message: string }>(`/contractors/${id}`),
};

// Task API functions
export const taskApi = {
  // Get all tasks with optional filters
  getAll: (filters?: {
    project_id?: number;
    contractor_id?: number;
    status?: string;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id.toString());
    if (filters?.contractor_id) params.append('contractor_id', filters.contractor_id.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return apiClient.get<Task[]>(endpoint);
  },

  // Get task by ID
  getById: (id: number): Promise<Task> => 
    apiClient.get<Task>(`/tasks/${id}`),

  // Create new task
  create: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => 
    apiClient.post<Task>('/tasks', data),

  // Update task
  update: (id: number, data: Partial<Task>): Promise<Task> => 
    apiClient.patch<Task>(`/tasks/${id}`, data),

  // Partial update task
  patch: (id: number, data: Partial<Task>): Promise<Task> => 
    apiClient.patch<Task>(`/tasks/${id}`, data),

  // Delete task
  delete: (id: number): Promise<{ message: string }> => 
    apiClient.delete<{ message: string }>(`/tasks/${id}`),
};

// Export all API functions
export const api = {
  projects: projectApi,
  contractors: contractorApi,
  tasks: taskApi,
};

// SWR hooks for data fetching and mutations
import useSWR, { mutate } from 'swr';
import { api, Project, Contractor, Task } from '../services/api';

// Generic fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Project hooks
export const useProjects = () => {
  const { data, error, isLoading } = useSWR<Project[]>('/api/projects', fetcher);
  return {
    projects: data || [],
    isLoading,
    error,
    mutate: () => mutate('/api/projects'),
  };
};

export const useProject = (id: number | null) => {
  const { data, error, isLoading } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    fetcher
  );
  return {
    project: data,
    isLoading,
    error,
    mutate: () => id && mutate(`/api/projects/${id}`),
  };
};

// Contractor hooks
export const useContractors = () => {
  const { data, error, isLoading } = useSWR<Contractor[]>('/api/contractors', fetcher);
  return {
    contractors: data || [],
    isLoading,
    error,
    mutate: () => mutate('/api/contractors'),
  };
};

export const useContractor = (id: number | null) => {
  const { data, error, isLoading } = useSWR<Contractor>(
    id ? `/api/contractors/${id}` : null,
    fetcher
  );
  return {
    contractor: data,
    isLoading,
    error,
    mutate: () => id && mutate(`/api/contractors/${id}`),
  };
};

// Task hooks
export const useTasks = (filters?: {
  project_id?: number;
  contractor_id?: number;
  status?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.project_id) params.append('project_id', filters.project_id.toString());
  if (filters?.contractor_id) params.append('contractor_id', filters.contractor_id.toString());
  if (filters?.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
  
  const { data, error, isLoading } = useSWR<Task[]>(endpoint, fetcher);
  return {
    tasks: data || [],
    isLoading,
    error,
    mutate: () => mutate(endpoint),
  };
};

export const useTask = (id: number | null) => {
  const { data, error, isLoading } = useSWR<Task>(
    id ? `/api/tasks/${id}` : null,
    fetcher
  );
  return {
    task: data,
    isLoading,
    error,
    mutate: () => id && mutate(`/api/tasks/${id}`),
  };
};

// Mutation hooks for optimistic updates
export const useProjectMutations = () => {
  const { mutate: mutateProjects } = useProjects();

  const createProject = async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await api.projects.create(data);
      mutateProjects();
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const updateProject = async (id: number, data: Partial<Project>) => {
    try {
      const updatedProject = await api.projects.update(id, data);
      mutateProjects();
      return updatedProject;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await api.projects.delete(id);
      mutateProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  return {
    createProject,
    updateProject,
    deleteProject,
  };
};

export const useContractorMutations = () => {
  const { mutate: mutateContractors } = useContractors();

  const createContractor = async (data: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newContractor = await api.contractors.create(data);
      mutateContractors();
      return newContractor;
    } catch (error) {
      console.error('Failed to create contractor:', error);
      throw error;
    }
  };

  const updateContractor = async (id: number, data: Partial<Contractor>) => {
    try {
      const updatedContractor = await api.contractors.update(id, data);
      mutateContractors();
      return updatedContractor;
    } catch (error) {
      console.error('Failed to update contractor:', error);
      throw error;
    }
  };

  const deleteContractor = async (id: number) => {
    try {
      await api.contractors.delete(id);
      mutateContractors();
    } catch (error) {
      console.error('Failed to delete contractor:', error);
      throw error;
    }
  };

  return {
    createContractor,
    updateContractor,
    deleteContractor,
  };
};

export const useTaskMutations = () => {
  const { mutate: mutateTasks } = useTasks();

  const createTask = async (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await api.tasks.create(data);
      mutateTasks();
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      const updatedTask = await api.tasks.update(id, data);
      mutateTasks();
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.tasks.delete(id);
      mutateTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
  };
};

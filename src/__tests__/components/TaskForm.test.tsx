import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskForm from '@/components/forms/TaskForm';

// Mock the API hooks
vi.mock('@/lib/hooks/useApi', () => ({
  useTaskMutations: () => ({
    createTask: vi.fn().mockResolvedValue({ id: 1, title: 'Test Task' }),
    updateTask: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Task' }),
    deleteTask: vi.fn().mockResolvedValue({ message: 'Task deleted' }),
  }),
  useProjects: () => ({
    projects: [
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' },
    ],
  }),
  useContractors: () => ({
    contractors: [
      { id: 1, name: 'Contractor 1', specialty: 'Electrical' },
      { id: 2, name: 'Contractor 2', specialty: 'Plumbing' },
    ],
  }),
}));

describe('TaskForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByText('Add a new task to track work progress and assign to contractors.')).toBeInTheDocument();
    expect(screen.getByLabelText('Project *')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign to Contractor')).toBeInTheDocument();
    expect(screen.getByLabelText('Estimated Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Actual Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Estimated Cost')).toBeInTheDocument();
    expect(screen.getByLabelText('Actual Cost')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    const task = {
      id: 1,
      project_id: 1,
      contractor_id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'in_progress' as const,
      priority: 'high' as const,
      estimated_hours: 8,
      actual_hours: 4,
      estimated_cost: 500,
      actual_cost: 250,
      due_date: '2025-02-01',
    };

    render(
      <TaskForm
        task={task}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="edit"
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('250')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-02-01')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project ID is required')).toBeInTheDocument();
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { createTask } = await import('@/lib/hooks/useApi');
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    // Select project
    const projectSelect = screen.getByRole('combobox', { name: 'Project *' });
    await user.click(projectSelect);
    await user.click(screen.getByText('Project 1'));

    await user.type(screen.getByLabelText('Task Title *'), 'Test Task');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    
    // Select status
    const statusSelect = screen.getByRole('combobox', { name: 'Status' });
    await user.click(statusSelect);
    await user.click(screen.getByText('In Progress'));

    // Select priority
    const prioritySelect = screen.getByRole('combobox', { name: 'Priority' });
    await user.click(prioritySelect);
    await user.click(screen.getByText('High'));

    // Select contractor
    const contractorSelect = screen.getByRole('combobox', { name: 'Assign to Contractor' });
    await user.click(contractorSelect);
    await user.click(screen.getByText('Contractor 1 (Electrical)'));

    await user.type(screen.getByLabelText('Estimated Hours'), '8');
    await user.type(screen.getByLabelText('Estimated Cost'), '500');
    await user.type(screen.getByLabelText('Due Date'), '2025-02-01');
    
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        project_id: 1,
        contractor_id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        priority: 'high',
        estimated_hours: 8,
        actual_hours: undefined,
        estimated_cost: 500,
        actual_cost: undefined,
        due_date: '2025-02-01',
        completed_date: undefined,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles optional contractor assignment', async () => {
    const user = userEvent.setup();
    const { createTask } = await import('@/lib/hooks/useApi');
    
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    // Select project
    const projectSelect = screen.getByRole('combobox', { name: 'Project *' });
    await user.click(projectSelect);
    await user.click(screen.getByText('Project 1'));

    await user.type(screen.getByLabelText('Task Title *'), 'Test Task');
    
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        project_id: 1,
        contractor_id: undefined,
        title: 'Test Task',
        description: undefined,
        status: 'pending',
        priority: 'medium',
        estimated_hours: undefined,
        actual_hours: undefined,
        estimated_cost: undefined,
        actual_cost: undefined,
        due_date: undefined,
        completed_date: undefined,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles form submission errors', async () => {
    const user = userEvent.setup();
    const { createTask } = await import('@/lib/hooks/useApi');
    vi.mocked(createTask).mockRejectedValueOnce(new Error('API Error'));

    render(
      <TaskForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    // Select project
    const projectSelect = screen.getByRole('combobox', { name: 'Project *' });
    await user.click(projectSelect);
    await user.click(screen.getByText('Project 1'));

    await user.type(screen.getByLabelText('Task Title *'), 'Test Task');
    
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createTask).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});

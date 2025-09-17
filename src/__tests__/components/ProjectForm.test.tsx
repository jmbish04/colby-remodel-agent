import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectForm from '@/components/forms/ProjectForm';

// Mock the API hooks
vi.mock('@/lib/hooks/useApi', () => ({
  useProjectMutations: () => ({
    createProject: vi.fn().mockResolvedValue({ id: 1, name: 'Test Project' }),
    updateProject: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Project' }),
    deleteProject: vi.fn().mockResolvedValue({ message: 'Project deleted' }),
  }),
}));

describe('ProjectForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByText('Add a new renovation project to track progress and manage tasks.')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    const project = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      address: '123 Test St',
      status: 'in_progress' as const,
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      budget_amount: 10000,
      actual_cost: 5000,
      progress_percentage: 50,
    };

    render(
      <ProjectForm
        project={project}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="edit"
      />
    );

    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Project' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { createProject } = await import('@/lib/hooks/useApi');
    
    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Project Name *'), 'Test Project');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText('Address'), '123 Test St');
    
    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
        address: '123 Test St',
        status: 'planning',
        start_date: '',
        end_date: '',
        budget_amount: 0,
        actual_cost: 0,
        progress_percentage: 0,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
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
    const { createProject } = await import('@/lib/hooks/useApi');
    vi.mocked(createProject).mockRejectedValueOnce(new Error('API Error'));

    render(
      <ProjectForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Project Name *'), 'Test Project');
    
    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});

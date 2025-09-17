import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContractorForm from '@/components/forms/ContractorForm';

// Mock the API hooks
vi.mock('@/lib/hooks/useApi', () => ({
  useContractorMutations: () => ({
    createContractor: vi.fn().mockResolvedValue({ id: 1, name: 'Test Contractor' }),
    updateContractor: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Contractor' }),
    deleteContractor: vi.fn().mockResolvedValue({ message: 'Contractor deleted' }),
  }),
}));

describe('ContractorForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    expect(screen.getByText('Add New Contractor')).toBeInTheDocument();
    expect(screen.getByText('Add a new contractor to your team for project assignments.')).toBeInTheDocument();
    expect(screen.getByLabelText('Contractor Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Specialty')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly Rate')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating (0-5)')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Active Contractor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Contractor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    const contractor = {
      id: 1,
      name: 'Test Contractor',
      company: 'Test Company',
      phone: '555-1234',
      email: 'test@example.com',
      specialty: 'Electrical',
      hourly_rate: 75,
      rating: 4.5,
      notes: 'Test notes',
      is_active: true,
    };

    render(
      <ContractorForm
        contractor={contractor}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="edit"
      />
    );

    expect(screen.getByText('Edit Contractor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Contractor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electrical')).toBeInTheDocument();
    expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Contractor' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Add Contractor' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Contractor name is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Contractor Name *'), 'Test Contractor');
    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: 'Add Contractor' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('validates rating range', async () => {
    const user = userEvent.setup();
    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Contractor Name *'), 'Test Contractor');
    await user.type(screen.getByLabelText('Rating (0-5)'), '6');
    
    const submitButton = screen.getByRole('button', { name: 'Add Contractor' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Number must be less than or equal to 5')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { createContractor } = await import('@/lib/hooks/useApi');
    
    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Contractor Name *'), 'Test Contractor');
    await user.type(screen.getByLabelText('Company'), 'Test Company');
    await user.type(screen.getByLabelText('Phone'), '555-1234');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Specialty'), 'Electrical');
    await user.type(screen.getByLabelText('Hourly Rate'), '75');
    await user.type(screen.getByLabelText('Rating (0-5)'), '4.5');
    await user.type(screen.getByLabelText('Notes'), 'Test notes');
    
    const submitButton = screen.getByRole('button', { name: 'Add Contractor' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createContractor).toHaveBeenCalledWith({
        name: 'Test Contractor',
        company: 'Test Company',
        phone: '555-1234',
        email: 'test@example.com',
        specialty: 'Electrical',
        hourly_rate: 75,
        rating: 4.5,
        notes: 'Test notes',
        is_active: true,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContractorForm
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
    const { createContractor } = await import('@/lib/hooks/useApi');
    vi.mocked(createContractor).mockRejectedValueOnce(new Error('API Error'));

    render(
      <ContractorForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        mode="create"
      />
    );

    await user.type(screen.getByLabelText('Contractor Name *'), 'Test Contractor');
    
    const submitButton = screen.getByRole('button', { name: 'Add Contractor' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createContractor).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});

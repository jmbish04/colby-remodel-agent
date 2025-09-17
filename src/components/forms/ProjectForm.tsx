"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Project, ProjectSchema } from '@/lib/services/api';
import { useProjectMutations } from '@/lib/hooks/useApi';

interface ProjectFormProps {
  project?: Project;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSuccess,
  onCancel,
  mode = 'create'
}) => {
  const { createProject, updateProject } = useProjectMutations();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<Project>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: project || {
      name: '',
      description: '',
      address: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget_amount: 0,
      actual_cost: 0,
      progress_percentage: 0,
    }
  });

  const statusValue = watch('status');

  const onSubmit = async (data: Project) => {
    setIsSubmitting(true);
    try {
      let result: Project;
      
      if (mode === 'edit' && project?.id) {
        result = await updateProject(project.id, data);
      } else {
        result = await createProject(data);
      }
      
      onSuccess?.(result);
      reset();
    } catch (error) {
      console.error('Failed to save project:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Project' : 'Edit Project'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new renovation project to track progress and manage tasks.'
            : 'Update project details and status.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Kitchen Renovation"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the project scope and goals..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Main St, City, State 12345"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_amount">Budget Amount</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                {...register('budget_amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.budget_amount && (
                <p className="text-sm text-red-500">{errors.budget_amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost</Label>
              <Input
                id="actual_cost"
                type="number"
                step="0.01"
                {...register('actual_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.actual_cost && (
                <p className="text-sm text-red-500">{errors.actual_cost.message}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Label htmlFor="progress_percentage">Progress Percentage</Label>
            <Input
              id="progress_percentage"
              type="number"
              min="0"
              max="100"
              {...register('progress_percentage', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.progress_percentage && (
              <p className="text-sm text-red-500">{errors.progress_percentage.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Project' : 'Update Project')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;

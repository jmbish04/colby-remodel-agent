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
import { Task, TaskSchema, Project, Contractor } from '@/lib/services/api';
import { useTaskMutations, useProjects, useContractors } from '@/lib/hooks/useApi';

interface TaskFormProps {
  task?: Task;
  onSuccess?: (task: Task) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  defaultProjectId?: number;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSuccess,
  onCancel,
  mode = 'create',
  defaultProjectId
}) => {
  const { createTask, updateTask } = useTaskMutations();
  const { projects } = useProjects();
  const { contractors } = useContractors();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    defaultValues: task || {
      project_id: defaultProjectId || 0,
      contractor_id: 0,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      estimated_hours: 0,
      actual_hours: 0,
      estimated_cost: 0,
      actual_cost: 0,
      due_date: '',
      completed_date: '',
    }
  });

  const statusValue = watch('status');
  const priorityValue = watch('priority');
  const projectIdValue = watch('project_id');
  const contractorIdValue = watch('contractor_id');

  const onSubmit = async (data: Task) => {
    setIsSubmitting(true);
    try {
      // Convert 0 values to undefined for optional fields
      const submitData = {
        ...data,
        contractor_id: data.contractor_id === 0 ? undefined : data.contractor_id,
        estimated_hours: data.estimated_hours === 0 ? undefined : data.estimated_hours,
        actual_hours: data.actual_hours === 0 ? undefined : data.actual_hours,
        estimated_cost: data.estimated_cost === 0 ? undefined : data.estimated_cost,
        actual_cost: data.actual_cost === 0 ? undefined : data.actual_cost,
      };

      let result: Task;
      
      if (mode === 'edit' && task?.id) {
        result = await updateTask(task.id, submitData);
      } else {
        result = await createTask(submitData);
      }
      
      onSuccess?.(result);
      reset();
    } catch (error) {
      console.error('Failed to save task:', error);
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
          {mode === 'create' ? 'Create New Task' : 'Edit Task'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new task to track work progress and assign to contractors.'
            : 'Update task details, status, and assignments.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select
              value={projectIdValue?.toString() || ''}
              onValueChange={(value) => setValue('project_id', parseInt(value))}
            >
              <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id?.toString() || ''}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && (
              <p className="text-sm text-red-500">{errors.project_id.message}</p>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Install new electrical outlets"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the task requirements and scope..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priorityValue}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Contractor Assignment */}
          <div className="space-y-2">
            <Label htmlFor="contractor_id">Assign to Contractor</Label>
            <Select
              value={contractorIdValue?.toString() || ''}
              onValueChange={(value) => setValue('contractor_id', value === '' ? 0 : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contractor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No contractor assigned</SelectItem>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor.id} value={contractor.id?.toString() || ''}>
                    {contractor.name} {contractor.specialty && `(${contractor.specialty})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contractor_id && (
              <p className="text-sm text-red-500">{errors.contractor_id.message}</p>
            )}
          </div>

          {/* Hours and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                {...register('estimated_hours', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.estimated_hours && (
                <p className="text-sm text-red-500">{errors.estimated_hours.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_hours">Actual Hours</Label>
              <Input
                id="actual_hours"
                type="number"
                step="0.5"
                {...register('actual_hours', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.actual_hours && (
                <p className="text-sm text-red-500">{errors.actual_hours.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                {...register('estimated_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.estimated_cost && (
                <p className="text-sm text-red-500">{errors.estimated_cost.message}</p>
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
            />
            {errors.due_date && (
              <p className="text-sm text-red-500">{errors.due_date.message}</p>
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
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Task' : 'Update Task')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;

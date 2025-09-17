"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Contractor, ContractorSchema } from '@/lib/services/api';
import { useContractorMutations } from '@/lib/hooks/useApi';

interface ContractorFormProps {
  contractor?: Contractor;
  onSuccess?: (contractor: Contractor) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const ContractorForm: React.FC<ContractorFormProps> = ({
  contractor,
  onSuccess,
  onCancel,
  mode = 'create'
}) => {
  const { createContractor, updateContractor } = useContractorMutations();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<Contractor>({
    resolver: zodResolver(ContractorSchema),
    defaultValues: contractor || {
      name: '',
      company: '',
      phone: '',
      email: '',
      specialty: '',
      hourly_rate: 0,
      rating: 0,
      notes: '',
      is_active: true,
    }
  });

  const isActiveValue = watch('is_active');

  const onSubmit = async (data: Contractor) => {
    setIsSubmitting(true);
    try {
      let result: Contractor;
      
      if (mode === 'edit' && contractor?.id) {
        result = await updateContractor(contractor.id, data);
      } else {
        result = await createContractor(data);
      }
      
      onSuccess?.(result);
      reset();
    } catch (error) {
      console.error('Failed to save contractor:', error);
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
          {mode === 'create' ? 'Add New Contractor' : 'Edit Contractor'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new contractor to your team for project assignments.'
            : 'Update contractor information and availability.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Contractor Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., John Smith"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="e.g., Smith Construction LLC"
            />
            {errors.company && (
              <p className="text-sm text-red-500">{errors.company.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@smithconstruction.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              {...register('specialty')}
              placeholder="e.g., Electrical, Plumbing, General Contractor"
            />
            {errors.specialty && (
              <p className="text-sm text-red-500">{errors.specialty.message}</p>
            )}
          </div>

          {/* Rate and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...register('hourly_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.hourly_rate && (
                <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                {...register('rating', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about the contractor..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Active Contractor</Label>
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
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Add Contractor' : 'Update Contractor')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractorForm;

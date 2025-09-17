"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Project, Contractor, Task } from '@/lib/services/api';
import ProjectForm from './ProjectForm';
import ContractorForm from './ContractorForm';
import TaskForm from './TaskForm';

interface BaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: any) => void;
  mode?: 'create' | 'edit';
}

interface ProjectFormModalProps extends BaseFormModalProps {
  type: 'project';
  item?: Project;
  defaultProjectId?: never;
}

interface ContractorFormModalProps extends BaseFormModalProps {
  type: 'contractor';
  item?: Contractor;
  defaultProjectId?: never;
}

interface TaskFormModalProps extends BaseFormModalProps {
  type: 'task';
  item?: Task;
  defaultProjectId?: number;
}

type FormModalProps = ProjectFormModalProps | ContractorFormModalProps | TaskFormModalProps;

const FormModal: React.FC<FormModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  item,
  defaultProjectId
}) => {
  const handleSuccess = (data: any) => {
    onSuccess?.(data);
    onClose();
  };

  const getTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const resource = type.charAt(0).toUpperCase() + type.slice(1);
    return `${action} ${resource}`;
  };

  const getDescription = () => {
    const action = mode === 'create' ? 'Add a new' : 'Update the';
    const resource = type;
    return `${action} ${resource} to your project management system.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {type === 'project' && (
            <ProjectForm
              project={item as Project}
              onSuccess={handleSuccess}
              onCancel={onClose}
              mode={mode}
            />
          )}
          
          {type === 'contractor' && (
            <ContractorForm
              contractor={item as Contractor}
              onSuccess={handleSuccess}
              onCancel={onClose}
              mode={mode}
            />
          )}
          
          {type === 'task' && (
            <TaskForm
              task={item as Task}
              onSuccess={handleSuccess}
              onCancel={onClose}
              mode={mode}
              defaultProjectId={defaultProjectId}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;

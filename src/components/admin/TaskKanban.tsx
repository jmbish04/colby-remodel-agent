"use client";

import React, { useState } from "react";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, User, Plus, Loader2 } from "lucide-react";
import { useTasks, useTaskMutations, useProjects, useContractors } from "@/lib/hooks/useApi";
import { Task, Project, Contractor } from "@/lib/services/api";
import FormModal from "@/components/forms/FormModal";

// Types for renovation tasks
interface RenovationTask {
  id: string;
  name: string;
  column: string;
  description: string;
  assignee?: {
    name: string;
    avatar?: string;
    specialty: string;
  };
  priority: "low" | "medium" | "high";
  estimatedHours: number;
  estimatedCost: number;
  dueDate?: Date;
  project: string;
}

interface TaskColumn {
  id: string;
  name: string;
  color: string;
}

// Task columns mapping
const taskColumns: TaskColumn[] = [
  { id: "pending", name: "Pending", color: "#6B7280" },
  { id: "in_progress", name: "In Progress", color: "#F59E0B" },
  { id: "completed", name: "Completed", color: "#10B981" },
  { id: "cancelled", name: "Cancelled", color: "#EF4444" },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const TaskKanban = () => {
  const { tasks: apiTasks, isLoading, error } = useTasks();
  const { projects } = useProjects();
  const { contractors } = useContractors();
  const { updateTask, deleteTask } = useTaskMutations();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Convert API tasks to RenovationTask format
  const tasks: RenovationTask[] = apiTasks.map((task: Task) => {
    const project = projects.find(p => p.id === task.project_id);
    const contractor = contractors.find(c => c.id === task.contractor_id);
    
    return {
      id: task.id?.toString() || '',
      name: task.title,
      column: task.status,
      description: task.description || '',
      assignee: contractor ? {
        name: contractor.name,
        specialty: contractor.specialty || '',
      } : undefined,
      priority: task.priority as "low" | "medium" | "high",
      estimatedHours: task.estimated_hours || 0,
      estimatedCost: task.estimated_cost || 0,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      project: project?.name || 'Unknown Project',
    };
  });

  const handleDataChange = (newTasks: RenovationTask[]) => {
    // This will be handled by drag and drop updates
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the task and update its status
    const task = apiTasks.find(t => t.id?.toString() === taskId);
    if (task && task.status !== newStatus) {
      try {
        await updateTask(parseInt(taskId), { status: newStatus as any });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditTask = (task: RenovationTask) => {
    const apiTask = apiTasks.find(t => t.id?.toString() === task.id);
    if (apiTask) {
      setSelectedTask(apiTask);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(parseInt(taskId));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Task Management</h2>
            <p className="text-muted-foreground">
              Drag and drop tasks between columns to update their status
            </p>
          </div>
          <Button onClick={handleCreateTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <KanbanProvider
        columns={taskColumns}
        data={tasks}
        onDataChange={handleDataChange}
        onDragEnd={handleDragEnd}
        className="h-[600px]"
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center justify-between">
                <span>{column.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {tasks.filter((task) => task.column === column.id).length}
                </Badge>
              </div>
            </KanbanHeader>
            
            <KanbanCards id={column.id}>
              {(task: RenovationTask) => (
                <KanbanCard key={task.id} {...task}>
                  <Card className="border-0 shadow-none p-0 group hover:shadow-sm transition-shadow">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {task.name}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditTask(task)}
                            >
                              <User className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-xs leading-relaxed">
                        {task.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-3 pt-0 space-y-2">
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {task.assignee.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.assignee.specialty}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimatedHours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${task.estimatedCost.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Due {task.dueDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <Badge variant="outline" className="text-xs w-fit">
                        {task.project}
                      </Badge>
                    </CardContent>
                  </Card>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Task Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Total Tasks</div>
            <div className="text-muted-foreground">{tasks.length}</div>
          </div>
          <div>
            <div className="font-medium">In Progress</div>
            <div className="text-muted-foreground">
              {tasks.filter(t => t.column === 'in_progress').length}
            </div>
          </div>
          <div>
            <div className="font-medium">Total Hours</div>
            <div className="text-muted-foreground">
              {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h
            </div>
          </div>
          <div>
            <div className="font-medium">Total Cost</div>
            <div className="text-muted-foreground">
              ${tasks.reduce((sum, task) => sum + task.estimatedCost, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <FormModal
        type="task"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        item={selectedTask || undefined}
        mode={modalMode}
      />
    </div>
  );
};

export default TaskKanban;

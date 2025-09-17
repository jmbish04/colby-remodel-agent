"use client";

import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for comprehensive task management
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  project: string;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  estimatedHours: number;
  actualHours?: number;
  budget: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  dependencies?: string[];
}

// Sample comprehensive task data
const sampleTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Kitchen Cabinet Installation",
    description: "Install new custom kitchen cabinets according to design specifications",
    status: "in_progress",
    priority: "high",
    project: "Kitchen Remodel - 123 Main St",
    assignee: {
      id: "u1",
      name: "Mike Johnson",
      email: "mike@renovateplus.com",
      role: "General Contractor"
    },
    reporter: {
      id: "u2",
      name: "Sarah Wilson",
      email: "sarah@homeowner.com"
    },
    estimatedHours: 32,
    actualHours: 28,
    budget: 2400,
    dueDate: new Date("2025-09-20"),
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-09-15"),
    tags: ["carpentry", "installation", "kitchen"],
    dependencies: ["TASK-002"]
  },
  {
    id: "TASK-002",
    title: "Electrical Rough-In",
    description: "Install electrical wiring for kitchen outlets, lighting, and appliances",
    status: "completed",
    priority: "high",
    project: "Kitchen Remodel - 123 Main St",
    assignee: {
      id: "u3",
      name: "Roberto Martinez",
      email: "roberto@electricpro.com",
      role: "Electrician"
    },
    reporter: {
      id: "u2",
      name: "Sarah Wilson",
      email: "sarah@homeowner.com"
    },
    estimatedHours: 24,
    actualHours: 26,
    budget: 1800,
    dueDate: new Date("2025-09-10"),
    createdAt: new Date("2025-08-25"),
    updatedAt: new Date("2025-09-10"),
    tags: ["electrical", "rough-in", "kitchen"]
  },
  {
    id: "TASK-003",
    title: "Bathroom Tile Installation",
    description: "Install ceramic tiles for bathroom walls and floors",
    status: "todo",
    priority: "medium",
    project: "Bathroom Renovation - 456 Oak Ave",
    assignee: {
      id: "u4",
      name: "Lisa Chen",
      email: "lisa@tileexperts.com",
      role: "Tile Installer"
    },
    reporter: {
      id: "u5",
      name: "David Brown",
      email: "david@homeowner.com"
    },
    estimatedHours: 40,
    budget: 3200,
    dueDate: new Date("2025-10-15"),
    createdAt: new Date("2025-09-10"),
    updatedAt: new Date("2025-09-10"),
    tags: ["tile", "installation", "bathroom"]
  },
  {
    id: "TASK-004",
    title: "HVAC System Installation",
    description: "Install new heating and cooling system for whole house",
    status: "review",
    priority: "urgent",
    project: "Full House Renovation - 789 Pine St",
    assignee: {
      id: "u6",
      name: "James Wilson",
      email: "james@hvacpros.com",
      role: "HVAC Technician"
    },
    reporter: {
      id: "u7",
      name: "Emma Davis",
      email: "emma@homeowner.com"
    },
    estimatedHours: 48,
    actualHours: 45,
    budget: 5500,
    dueDate: new Date("2025-09-25"),
    createdAt: new Date("2025-08-20"),
    updatedAt: new Date("2025-09-14"),
    tags: ["hvac", "installation", "mechanical"]
  }
];

const statusColors = {
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200"
};

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

const TasksView = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "completed").length;
    const totalBudget = tasks.reduce((sum, t) => sum + t.budget, 0);
    const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    
    return { total, completed, inProgress, overdue, totalBudget, totalHours };
  }, [tasks]);

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length 
        ? [] 
        : filteredTasks.map(task => task.id)
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Comprehensive task tracking and project management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-64 px-3 py-1 text-sm border rounded-md"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedTasks.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length} task(s) selected
              </span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
                
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleSelectTask(task.id)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {task.id}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize", statusColors[task.status])}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize", priorityColors[task.priority])}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback>
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{task.assignee.name}</div>
                          <div className="text-xs text-muted-foreground">{task.assignee.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{task.project}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className={cn(
                        "text-sm",
                        isOverdue && "text-red-600 font-medium"
                      )}>
                        {task.dueDate.toLocaleDateString()}
                        {isOverdue && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-medium">
                        ${task.budget.toLocaleString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {task.actualHours || 0}/{task.estimatedHours}h
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksView;

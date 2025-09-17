"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot,
  Calendar,
  Camera,
  Clock,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Monitor,
  Package,
  Settings,
  Shield,
  Smartphone,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for app management
interface App {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "communication" | "integration" | "ai" | "monitoring";
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "inactive" | "pending" | "error";
  version: string;
  lastUpdated: Date;
  provider: string;
  isBuiltIn: boolean;
  settings?: {
    webhookUrl?: string;
    apiKey?: string;
    features?: string[];
  };
  metrics?: {
    requests: number;
    uptime: number;
    errors: number;
  };
}

// Sample renovation-focused apps
const sampleApps: App[] = [
  {
    id: "ai-assistant",
    name: "AI Construction Assistant",
    description: "Smart AI that provides building codes, contractor recommendations, and project planning assistance",
    category: "ai",
    icon: Bot,
    status: "active",
    version: "2.1.0",
    lastUpdated: new Date("2025-09-14"),
    provider: "Built-in",
    isBuiltIn: true,
    metrics: {
      requests: 1247,
      uptime: 99.8,
      errors: 2
    }
  },
  {
    id: "project-calendar",
    name: "Project Calendar",
    description: "Synchronized calendar for tracking project milestones, contractor schedules, and permit deadlines",
    category: "productivity",
    icon: Calendar,
    status: "active",
    version: "1.5.2",
    lastUpdated: new Date("2025-09-10"),
    provider: "Google Calendar",
    isBuiltIn: false,
    settings: {
      webhookUrl: "https://calendar.googleapis.com/webhook",
      features: ["milestone-tracking", "contractor-scheduling", "permit-reminders"]
    },
    metrics: {
      requests: 892,
      uptime: 98.5,
      errors: 5
    }
  },
  {
    id: "contractor-portal",
    name: "Contractor Communication Hub",
    description: "Dedicated communication platform for contractors to submit updates, photos, and time tracking",
    category: "communication",
    icon: Users,
    status: "active",
    version: "3.0.1",
    lastUpdated: new Date("2025-09-12"),
    provider: "Built-in",
    isBuiltIn: true,
    settings: {
      features: ["photo-uploads", "time-tracking", "progress-reports", "messaging"]
    },
    metrics: {
      requests: 2156,
      uptime: 99.2,
      errors: 8
    }
  },
  {
    id: "permit-tracker",
    name: "Permit & Inspection Tracker",
    description: "Integration with local building departments to track permit status and schedule inspections",
    category: "integration",
    icon: FileText,
    status: "pending",
    version: "1.2.0",
    lastUpdated: new Date("2025-09-08"),
    provider: "BuildingDept.gov",
    isBuiltIn: false,
    settings: {
      apiKey: "bd_***_***",
      features: ["permit-status", "inspection-scheduling", "code-compliance"]
    }
  },
  {
    id: "progress-camera",
    name: "Progress Photo System",
    description: "Automated photo capture and organization system for tracking renovation progress",
    category: "monitoring",
    icon: Camera,
    status: "active",
    version: "2.3.0",
    lastUpdated: new Date("2025-09-13"),
    provider: "CloudVision AI",
    isBuiltIn: false,
    settings: {
      webhookUrl: "https://api.cloudvision.com/webhook",
      features: ["auto-tagging", "timeline-view", "comparison-mode"]
    },
    metrics: {
      requests: 445,
      uptime: 97.8,
      errors: 12
    }
  },
  {
    id: "material-orders",
    name: "Material Order Management",
    description: "Integration with supply stores for tracking material orders, deliveries, and inventory",
    category: "integration",
    icon: Package,
    status: "inactive",
    version: "1.8.3",
    lastUpdated: new Date("2025-08-25"),
    provider: "Home Depot Pro",
    isBuiltIn: false,
    settings: {
      apiKey: "hd_***_***",
      features: ["order-tracking", "delivery-scheduling", "inventory-alerts"]
    }
  },
  {
    id: "budget-monitor",
    name: "Budget & Cost Monitor",
    description: "Real-time budget tracking with alerts for cost overruns and payment scheduling",
    category: "productivity",
    icon: Monitor,
    status: "active",
    version: "1.4.1",
    lastUpdated: new Date("2025-09-11"),
    provider: "Built-in",
    isBuiltIn: true,
    settings: {
      features: ["cost-alerts", "payment-reminders", "expense-tracking"]
    },
    metrics: {
      requests: 678,
      uptime: 99.5,
      errors: 3
    }
  },
  {
    id: "weather-alerts",
    name: "Weather & Site Conditions",
    description: "Weather monitoring with alerts for conditions that could affect outdoor construction work",
    category: "monitoring",
    icon: Globe,
    status: "active",
    version: "1.1.5",
    lastUpdated: new Date("2025-09-15"),
    provider: "WeatherAPI",
    isBuiltIn: false,
    settings: {
      apiKey: "wa_***_***",
      features: ["weather-alerts", "work-stoppage-notifications", "safety-warnings"]
    },
    metrics: {
      requests: 234,
      uptime: 99.9,
      errors: 0
    }
  }
];

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200"
};

const categoryColors = {
  productivity: "bg-blue-100 text-blue-800",
  communication: "bg-purple-100 text-purple-800",
  integration: "bg-orange-100 text-orange-800",
  ai: "bg-green-100 text-green-800",
  monitoring: "bg-cyan-100 text-cyan-800"
};

const AppsView = () => {
  const [apps, setApps] = useState<App[]>(sampleApps);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredApps = selectedCategory === "all" 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  const stats = {
    total: apps.length,
    active: apps.filter(app => app.status === "active").length,
    inactive: apps.filter(app => app.status === "inactive").length,
    pending: apps.filter(app => app.status === "pending").length,
    errors: apps.filter(app => app.status === "error").length
  };

  const handleToggleApp = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, status: app.status === "active" ? "inactive" : "active" }
        : app
    ));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Apps & Integrations</h1>
          <p className="text-muted-foreground">
            Manage renovation tools, integrations, and connected services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Browse Apps
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Apps</TabsTrigger>
          <TabsTrigger value="ai">AI & Automation</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              
              return (
                <Card key={app.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", statusColors[app.status])}
                            >
                              {app.status}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", categoryColors[app.category])}
                            >
                              {app.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Switch
                        checked={app.status === "active"}
                        onCheckedChange={() => handleToggleApp(app.id)}
                        disabled={app.status === "pending" || app.status === "error"}
                      />
                    </div>
                    
                    <CardDescription className="text-sm leading-relaxed">
                      {app.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Provider</div>
                        <div className="font-medium">{app.provider}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Version</div>
                        <div className="font-medium">{app.version}</div>
                      </div>
                    </div>
                    
                    {app.metrics && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{app.metrics.requests}</div>
                          <div className="text-muted-foreground">Requests</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{app.metrics.uptime}%</div>
                          <div className="text-muted-foreground">Uptime</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold text-red-600">{app.metrics.errors}</div>
                          <div className="text-muted-foreground">Errors</div>
                        </div>
                      </div>
                    )}
                    
                    {app.settings?.features && (
                      <div>
                        <div className="text-sm font-medium mb-2">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {app.settings.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {app.settings.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.settings.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      {!app.isBuiltIn && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No apps found in this category.
              </div>
              <Button variant="outline" className="mt-4">
                Browse Available Apps
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>
            Popular integrations for renovation project management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5" />
                <h3 className="font-medium">Email Notifications</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get notified about project updates, deadline reminders, and contractor messages.
              </p>
              <Button variant="outline" size="sm">Setup Email</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-medium">SMS Alerts</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Receive critical alerts and emergency notifications via text message.
              </p>
              <Button variant="outline" size="sm">Setup SMS</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5" />
                <h3 className="font-medium">Mobile App</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Download the mobile app for on-site access and photo uploads.
              </p>
              <Button variant="outline" size="sm">Download App</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppsView;

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BarChart3,
  Zap,
  Settings,
  MessageSquare,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  currentPath?: string;
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and quick actions"
  },
  {
    name: "Task Board",
    href: "/admin/tasks",
    icon: CheckSquare,
    description: "Kanban task management"
  },
  {
    name: "Timeline",
    href: "/admin/timeline",
    icon: Calendar,
    description: "Project timeline view"
  },
  {
    name: "Task Analytics",
    href: "/admin/tasks-view",
    icon: BarChart3,
    description: "Advanced task data"
  },
  {
    name: "Apps",
    href: "/admin/apps",
    icon: Zap,
    description: "Integrations & tools"
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration"
  },
  {
    name: "AI Assistant",
    href: "/chat",
    icon: MessageSquare,
    description: "Get renovation help"
  },
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Return to homepage"
  }
];

const AdminNav = ({ currentPath, className }: AdminNavProps) => {
  return (
    <nav className={cn("space-y-1", className)}>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;
        
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
              "hover:bg-muted/50",
              isActive && "bg-muted text-foreground font-medium"
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex-1">
              <div>{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </a>
        );
      })}
    </nav>
  );
};

export default AdminNav;

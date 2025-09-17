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
  Bell,
  Database,
  Globe,
  Lock,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sun,
  User,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for settings management
interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  email: {
    taskUpdates: boolean;
    projectMilestones: boolean;
    budgetAlerts: boolean;
    contractorMessages: boolean;
    weeklyReports: boolean;
  };
  push: {
    taskUpdates: boolean;
    emergencyAlerts: boolean;
    deadlineReminders: boolean;
  };
  sms: {
    emergencyOnly: boolean;
    criticalAlerts: boolean;
  };
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  colorScheme: "blue" | "green" | "orange" | "purple";
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  allowedIPs: string[];
}

interface IntegrationSettings {
  googleCalendar: {
    enabled: boolean;
    syncTasks: boolean;
    syncMilestones: boolean;
  };
  slack: {
    enabled: boolean;
    channel: string;
    notifications: string[];
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    fromAddress: string;
  };
}

const SettingsView = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Sarah Wilson",
    email: "sarah@colbyremodel.com",
    role: "Project Manager",
    company: "Colby Remodel Agency",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    language: "en-US"
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      taskUpdates: true,
      projectMilestones: true,
      budgetAlerts: true,
      contractorMessages: true,
      weeklyReports: false
    },
    push: {
      taskUpdates: true,
      emergencyAlerts: true,
      deadlineReminders: true
    },
    sms: {
      emergencyOnly: true,
      criticalAlerts: false
    }
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    colorScheme: "blue",
    sidebarCollapsed: false,
    compactMode: false
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 24,
    passwordExpiry: 90,
    allowedIPs: []
  });

  const [integrations, setIntegrations] = useState<IntegrationSettings>({
    googleCalendar: {
      enabled: true,
      syncTasks: true,
      syncMilestones: true
    },
    slack: {
      enabled: false,
      channel: "#renovations",
      notifications: ["task-completed", "budget-alert"]
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      fromAddress: "noreply@colbyremodel.com"
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Here you would save the settings to your backend
    console.log("Saving settings...", {
      userProfile,
      notifications,
      appearance,
      security,
      integrations
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and system configuration
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => {
                      setUserProfile(prev => ({ ...prev, name: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="w-full h-10 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => {
                      setUserProfile(prev => ({ ...prev, email: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="w-full h-10 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select 
                    value={userProfile.role} 
                    onValueChange={(value) => {
                      setUserProfile(prev => ({ ...prev, role: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="General Contractor">General Contractor</SelectItem>
                      <SelectItem value="Homeowner">Homeowner</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <input
                    type="text"
                    value={userProfile.company}
                    onChange={(e) => {
                      setUserProfile(prev => ({ ...prev, company: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="w-full h-10 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => {
                      setUserProfile(prev => ({ ...prev, phone: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="w-full h-10 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select 
                    value={userProfile.timezone} 
                    onValueChange={(value) => {
                      setUserProfile(prev => ({ ...prev, timezone: value }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what updates you'd like to receive via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'taskUpdates' && 'Get notified when tasks are updated or completed'}
                      {key === 'projectMilestones' && 'Receive updates on project milestone achievements'}
                      {key === 'budgetAlerts' && 'Alerts when budget thresholds are exceeded'}
                      {key === 'contractorMessages' && 'Messages and updates from contractors'}
                      {key === 'weeklyReports' && 'Weekly summary of project progress'}
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({
                        ...prev,
                        email: { ...prev.email, [key]: checked }
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Mobile and desktop push notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'taskUpdates' && 'Push notifications for task changes'}
                      {key === 'emergencyAlerts' && 'Critical alerts requiring immediate attention'}
                      {key === 'deadlineReminders' && 'Reminders for approaching deadlines'}
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                      setNotifications(prev => ({
                        ...prev,
                        push: { ...prev.push, [key]: checked }
                      }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-3">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Globe, label: "System" }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setAppearance(prev => ({ ...prev, theme: value as any }));
                        setHasChanges(true);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 border rounded-lg",
                        appearance.theme === value && "border-primary bg-primary/5"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Color Scheme</label>
                <div className="flex gap-3">
                  {[
                    { value: "blue", color: "bg-blue-500" },
                    { value: "green", color: "bg-green-500" },
                    { value: "orange", color: "bg-orange-500" },
                    { value: "purple", color: "bg-purple-500" }
                  ].map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setAppearance(prev => ({ ...prev, colorScheme: value as any }));
                        setHasChanges(true);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        color,
                        appearance.colorScheme === value ? "border-foreground" : "border-border"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compact Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Use a more compact layout to fit more content
                    </div>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => {
                      setAppearance(prev => ({ ...prev, compactMode: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Collapsed Sidebar</div>
                    <div className="text-sm text-muted-foreground">
                      Start with sidebar collapsed by default
                    </div>
                  </div>
                  <Switch
                    checked={appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => {
                      setAppearance(prev => ({ ...prev, sidebarCollapsed: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {security.twoFactorEnabled && (
                    <Badge variant="outline" className="text-green-600">Enabled</Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
                      setHasChanges(true);
                    }}
                  >
                    {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (hours)</label>
                  <Select 
                    value={security.sessionTimeout.toString()} 
                    onValueChange={(value) => {
                      setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(value) }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password Expiry (days)</label>
                  <Select 
                    value={security.passwordExpiry.toString()} 
                    onValueChange={(value) => {
                      setSecurity(prev => ({ ...prev, passwordExpiry: parseInt(value) }));
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Connected Services
              </CardTitle>
              <CardDescription>
                Manage your third-party integrations and connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Google Calendar</div>
                      <div className="text-sm text-muted-foreground">
                        Sync project milestones and deadlines
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.googleCalendar.enabled && (
                      <Badge variant="outline" className="text-green-600">Connected</Badge>
                    )}
                    <Switch
                      checked={integrations.googleCalendar.enabled}
                      onCheckedChange={(checked) => {
                        setIntegrations(prev => ({
                          ...prev,
                          googleCalendar: { ...prev.googleCalendar, enabled: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Slack</div>
                      <div className="text-sm text-muted-foreground">
                        Team notifications and updates
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.slack.enabled && (
                      <Badge variant="outline" className="text-green-600">Connected</Badge>
                    )}
                    <Switch
                      checked={integrations.slack.enabled}
                      onCheckedChange={(checked) => {
                        setIntegrations(prev => ({
                          ...prev,
                          slack: { ...prev.slack, enabled: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Email Service</div>
                      <div className="text-sm text-muted-foreground">
                        SMTP configuration for outbound emails
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                System status and configuration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-medium">v2.1.0</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Database</div>
                    <div className="font-medium">Cloudflare D1</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage</div>
                    <div className="font-medium">Cloudflare R2</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-medium text-green-600">99.9%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Backup</div>
                    <div className="font-medium">Today, 3:00 AM</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Environment</div>
                    <div className="font-medium">Production</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsView;

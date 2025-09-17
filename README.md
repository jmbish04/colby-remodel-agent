# Colby Remodel Agent

A sophisticated home renovation project management system built with Astro, React, and Cloudflare's developer platform.

## Features

- **AI Assistant**: Get expert renovation advice, building codes, and regulations
  - Basic chat interface for general renovation questions
  - Sources chat with industry references and code citations
  - Specialized knowledge in construction project management
- **Task Management**: Multi-view task management system
  - Drag-and-drop kanban board for visual task tracking
  - Comprehensive data tables with filtering and search
  - Gantt chart visualization for project scheduling
- **Apps & Integrations**: Connected service management
  - Built-in renovation tools (AI Assistant, Budget Monitor, etc.)
  - Third-party integrations (Google Calendar, Slack, etc.)
  - App status monitoring and configuration
- **Settings & Configuration**: Comprehensive system settings
  - User profile and preferences
  - Notification management (email, push, SMS)
  - Appearance customization (themes, colors)
  - Security settings (2FA, session management)
  - Integration configuration
- **Project Management**: Create and track multiple renovation projects
- **Contractor Management**: Organize contractor information and specialties
- **Budget Control**: Monitor costs and stay within budget
- **Progress Monitoring**: Track completion percentages and deadlines
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Astro + React + TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV + R2
- **AI**: OpenAI GPT-4 via ai-sdk
- **Package Manager**: pnpm

## Admin Dashboard Features

### Task Management
- **📋 Task Board** (`/admin/tasks`) - Kanban-style task management
- **📅 Project Timeline** (`/admin/timeline`) - Gantt chart view
- **📊 Task Analytics** (`/admin/tasks-view`) - Advanced data tables with filtering

### System Management  
- **🚀 Apps & Integrations** (`/admin/apps`) - Manage connected services
- **⚙️ Settings** (`/admin/settings`) - System configuration
- **🤖 AI Assistant** (`/chat`) - Smart renovation assistant

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Cloudflare account
- OpenAI API key (for AI features)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Add your OpenAI API key to .env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. Set up Cloudflare resources (already done):
   ```bash
   # Database and KV namespace are already created
   # Database ID: 670563cf-1f1d-4469-aea4-ca0fbfec3039
   # KV ID: f09fe0049bea40c79ee0935e86969e27
   ```

4. Run database migrations (already done):
   ```bash
   pnpm run db:migrate
   ```

5. Start development server:
   ```bash
   pnpm run dev
   ```

6. Set up production secrets:
   ```bash
   # For production deployment, set OpenAI API key as a secret
   npx wrangler secret put OPENAI_API_KEY
   ```

### Development Commands

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run deploy` - Deploy to Cloudflare
- `pnpm run db:migrate` - Run database migrations
- `pnpm run type-check` - Type checking
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Project Structure

```
src/
├── components/
│   ├── ai/             # AI conversation components
│   ├── admin/          # Admin dashboard components
│   │   ├── TaskKanban.tsx       # Kanban board
│   │   ├── TasksView.tsx        # Advanced task table
│   │   ├── ProjectTimeline.tsx  # Gantt chart
│   │   ├── AppsView.tsx         # App management
│   │   └── SettingsView.tsx     # Settings interface
│   ├── chat/           # Chat page components
│   ├── ui/             # Reusable UI components
│   │   ├── shadcn-io/  # Advanced components (kanban, gantt)
│   │   └── ...         # Basic UI components
│   └── ...
├── layouts/            # Astro layouts
├── lib/
│   └── services/       # Data access layer
├── pages/
│   ├── admin/          # Admin pages
│   │   ├── tasks.astro          # Kanban board page
│   │   ├── tasks-view.astro     # Task analytics page
│   │   ├── timeline.astro       # Timeline page
│   │   ├── apps.astro           # Apps management page
│   │   ├── settings.astro       # Settings page
│   │   └── ...
│   ├── api/
│   │   ├── chat/       # AI chat endpoints
│   │   └── sources/    # AI sources endpoints
│   ├── chat/           # AI chat pages
│   └── ...
├── styles/             # Global styles
└── workflows/          # Cloudflare Workflows

migrations/             # Database schema migrations
```

## Key Components

### Task Management System
- **Kanban Board**: Drag-and-drop interface with status columns
- **Data Tables**: Advanced filtering, search, and bulk operations
- **Timeline View**: Gantt chart for project scheduling
- **Task Analytics**: Comprehensive statistics and reporting

### Apps & Integrations
- **Built-in Apps**: AI Assistant, Budget Monitor, Progress Camera
- **Third-party Integrations**: Google Calendar, Slack, WeatherAPI
- **Status Monitoring**: Uptime, request counts, error tracking
- **Configuration Management**: Settings and API key management

### Settings System
- **Profile Management**: User info, timezone, preferences
- **Notifications**: Email, push, and SMS notification settings
- **Appearance**: Theme, colors, layout customization
- **Security**: 2FA, session management, password policies
- **Integrations**: Connected service configuration
- **System Info**: Version, uptime, backup status

## License

MIT

## Support

For support, please visit our documentation or contact support@colbyremodel.com

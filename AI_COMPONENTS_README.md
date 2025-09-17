# AI Components Documentation

This project includes a comprehensive set of AI-powered React components built with the AI SDK and shadcn/ui. Each component demonstrates different AI capabilities and can be used independently or together.

## Components Overview

### Core Components

#### 1. **Chat** (`/components/ai/chat.tsx`)
Basic conversational AI interface with streaming responses.
- Uses `useChat` hook from `@ai-sdk/react`
- Supports real-time streaming
- Includes loading states and scroll-to-bottom functionality

#### 2. **Reasoning Chat** (`/components/ai/reasoning-chat.tsx`)
AI that shows its step-by-step reasoning process.
- Displays reasoning in collapsible sections
- Supports streaming reasoning content
- Uses `/api/reasoning` endpoint

#### 3. **Sources Chat** (`/components/chat/SourcesChat.tsx`)
AI with web search and source citations.
- Displays sources with links and titles
- Collapsible sources section
- Uses `/api/sources` endpoint with Perplexity integration

#### 4. **Suggestion Chat** (`/components/ai/suggestion-chat.tsx`)
AI with conversation starters and suggestions.
- Shows starter prompts when conversation is empty
- Click-to-send suggestion functionality
- Uses `/api/suggestion` endpoint

#### 5. **Task Workflow** (`/components/ai/task-workflow.tsx`)
AI that generates and manages task workflows.
- Creates structured task lists with file operations
- Uses `useObject` hook for structured data
- Uses `/api/task` endpoint

#### 6. **Tool Demo** (`/components/ai/tool-demo.tsx`)
AI with function calling and tool usage.
- Demonstrates tool execution (calculator, web search)
- Shows tool inputs and outputs
- Uses `/api/tools` endpoint

#### 7. **UI Generator** (`/components/ai/ui-generator.tsx`)
AI that generates user interfaces.
- Web preview with navigation
- URL input and refresh functionality
- Uses `/api/generate-ui` endpoint

#### 8. **Image Generator** (`/components/ai/image.tsx`)
AI-powered image generation.
- DALL-E 3 integration
- Image preview and download
- Uses `/api/image` endpoint

#### 9. **Citation Demo** (`/components/ai/inline-citation.tsx`)
AI with inline citations and references.
- Interactive citation cards
- Carousel-style citation display
- Uses `/api/citation` endpoint

### UI Components

#### **Conversation** (`/components/ai/conversation.tsx`)
Main conversation container with scrolling.
- `Conversation`: Main wrapper
- `ConversationContent`: Scrollable content area
- `ConversationScrollButton`: Auto-scroll to bottom

#### **Message** (`/components/ai/message.tsx`)
Message display component.
- `Message`: Message wrapper with role styling
- `MessageContent`: Message content container

#### **Prompt Input** (`/components/ai/prompt-input.tsx`)
Advanced input component with toolbar.
- `PromptInput`: Main form wrapper
- `PromptInputTextarea`: Auto-resizing textarea
- `PromptInputToolbar`: Action buttons container
- `PromptInputSubmit`: Submit button with loading states

#### **Response** (`/components/ai/response.tsx`)
Rich text response rendering with markdown support.

#### **Loader** (`/components/ai/loader.tsx`)
Loading spinner component with customizable size.

#### **Actions** (`/components/ai/actions.tsx`)
Message action buttons (retry, copy, etc.).
- `Actions`: Container for action buttons
- `Action`: Individual action button

### Specialized Components

#### **Reasoning** (`/components/ai/reasoning.tsx`)
Collapsible reasoning display.
- `Reasoning`: Main reasoning container
- `ReasoningTrigger`: Toggle button
- `ReasoningContent`: Reasoning text content

#### **Sources** (`/components/ai/sources.tsx`)
Source citation display.
- `Sources`: Main sources container
- `SourcesTrigger`: Toggle sources visibility
- `SourcesContent`: Sources list
- `Source`: Individual source link

#### **Suggestions** (`/components/ai/suggestion.tsx`)
Conversation starter suggestions.
- `Suggestions`: Container for suggestion buttons
- `Suggestion`: Individual suggestion button

#### **Task** (`/components/ai/task.tsx`)
Task workflow display.
- `Task`: Main task container
- `TaskTrigger`: Task title and toggle
- `TaskContent`: Task items list
- `TaskItem`: Individual task item
- `TaskItemFile`: File reference in task

#### **Tool** (`/components/ai/tool.tsx`)
Tool execution display.
- `Tool`: Main tool container
- `ToolHeader`: Tool name and status
- `ToolContent`: Tool details
- `ToolInput`: Tool input parameters
- `ToolOutput`: Tool execution results

#### **Web Preview** (`/components/ai/web-preview.tsx`)
Web page preview component.
- `WebPreview`: Main preview container
- `WebPreviewNavigation`: URL bar and controls
- `WebPreviewUrl`: URL input field
- `WebPreviewBody`: Content iframe

## API Routes

All API routes are located in `/pages/api/` and follow Astro's `APIRoute` pattern:

- `/api/chat` - Basic chat endpoint
- `/api/reasoning` - Reasoning with step-by-step output
- `/api/sources` - Chat with source citations
- `/api/suggestion` - Chat with suggestions
- `/api/task` - Task workflow generation
- `/api/tools` - Chat with tool calling
- `/api/generate-ui` - UI generation
- `/api/image` - Image generation (DALL-E 3)
- `/api/citation` - Chat with inline citations

## Usage

### Basic Setup

```tsx
import Chat from "@/components/ai/chat";

export default function MyPage() {
  return (
    <div className="h-screen">
      <Chat />
    </div>
  );
}
```

### Advanced Configuration

```tsx
import { useChat } from "@ai-sdk/react";

function CustomChat() {
  const { messages, append, status } = useChat({
    api: "/api/reasoning",
    // Custom configuration
  });

  // Your custom implementation
}
```

## Demo Page

Visit `/ai-demo` to see all components in action with a tabbed interface showcasing each AI capability.

## Dependencies

- `@ai-sdk/react` - React hooks for AI
- `@ai-sdk/openai` - OpenAI integration
- `@ai-sdk/perplexity` - Perplexity integration (optional)
- `lucide-react` - Icons
- `zod` - Schema validation
- `shadcn/ui` - UI components

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
# Add other API keys as needed for different providers
```

## Features

- ✅ Real-time streaming responses
- ✅ Tool/function calling
- ✅ Source citations and references
- ✅ Image generation
- ✅ Task workflow generation
- ✅ UI generation preview
- ✅ Reasoning step display
- ✅ Conversation suggestions
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Accessibility features

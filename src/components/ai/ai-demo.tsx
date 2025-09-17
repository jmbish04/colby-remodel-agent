"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all AI components
import Chat from "@/components/ai/chat";
import ReasoningChat from "@/components/ai/reasoning-chat";
import SourcesChat from "@/components/chat/SourcesChat";
import SuggestionChat from "@/components/ai/suggestion-chat";
import TaskWorkflow from "@/components/ai/task-workflow";
import ToolDemo from "@/components/ai/tool-demo";
import UIGenerator from "@/components/ai/ui-generator";
import ImageGenerator from "@/components/ai/image";
import CitationDemo from "@/components/ai/inline-citation";

const aiComponents = [
  {
    id: "chat",
    title: "Basic Chat",
    description: "Simple conversational AI interface",
    component: Chat,
  },
  {
    id: "reasoning",
    title: "Reasoning Chat",
    description: "AI that shows its step-by-step reasoning process",
    component: ReasoningChat,
  },
  {
    id: "sources",
    title: "Sources Chat",
    description: "AI with web search and source citations",
    component: SourcesChat,
  },
  {
    id: "suggestions",
    title: "Suggestion Chat",
    description: "AI with conversation starters and suggestions",
    component: SuggestionChat,
  },
  {
    id: "tasks",
    title: "Task Workflow",
    description: "AI that generates and manages task workflows",
    component: TaskWorkflow,
  },
  {
    id: "tools",
    title: "Tool Demo",
    description: "AI with function calling and tool usage",
    component: ToolDemo,
  },
  {
    id: "ui-generator",
    title: "UI Generator",
    description: "AI that generates user interfaces",
    component: UIGenerator,
  },
  {
    id: "image",
    title: "Image Generator",
    description: "AI-powered image generation",
    component: ImageGenerator,
  },
  {
    id: "citations",
    title: "Citation Demo",
    description: "AI with inline citations and references",
    component: CitationDemo,
  },
];

export default function AIDemo() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Components Demo</h1>
        <p className="text-muted-foreground">
          Explore different AI-powered components and their capabilities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
          {aiComponents.map((component) => (
            <TabsTrigger
              key={component.id}
              value={component.id}
              className="text-xs"
            >
              {component.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {aiComponents.map((component) => {
          const Component = component.component;
          return (
            <TabsContent key={component.id} value={component.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{component.title}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] border rounded-lg overflow-hidden">
                    <Component />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

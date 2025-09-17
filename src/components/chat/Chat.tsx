"use client";

import React, { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, append, status } = useChat({
    api: "/api/chat",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      append({ role: "user", content: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="text-4xl">🏠</div>
              <div>
                <h3 className="text-lg font-semibold">Welcome to your AI Renovation Assistant</h3>
                <p className="text-muted-foreground mt-2">
                  I'm here to help you with project planning, contractor management, budgeting, and more!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-md">
                <button
                  onClick={() => append({ role: "user", content: "Help me plan a kitchen renovation" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  Help me plan a kitchen renovation
                </button>
                <button
                  onClick={() => append({ role: "user", content: "What permits do I need for a bathroom remodel?" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  What permits do I need for a bathroom remodel?
                </button>
                <button
                  onClick={() => append({ role: "user", content: "How do I find reliable contractors?" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  How do I find reliable contractors?
                </button>
                <button
                  onClick={() => append({ role: "user", content: "Help me create a renovation budget" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  Help me create a renovation budget
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                <Response>{message.content}</Response>
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputTextarea
          value={input}
          placeholder="Ask me anything about your renovation project..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <PromptInputSubmit status={status} disabled={!input.trim()} />
      </PromptInput>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai/sources";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";

export default function SourcesChat() {
  const [input, setInput] = useState("");
  const { messages, append, status } = useChat({
    api: "/api/sources",
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
              <div className="text-4xl">📚</div>
              <div>
                <h3 className="text-lg font-semibold">AI Assistant with Sources</h3>
                <p className="text-muted-foreground mt-2">
                  Get renovation advice with references to building codes, regulations, and industry resources.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-md">
                <button
                  onClick={() => append({ role: "user", content: "What are the current building codes for electrical work?" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  What are the current building codes for electrical work?
                </button>
                <button
                  onClick={() => append({ role: "user", content: "Show me EPA guidelines for lead-safe renovation" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  Show me EPA guidelines for lead-safe renovation
                </button>
                <button
                  onClick={() => append({ role: "user", content: "What are the latest energy efficiency standards?" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  What are the latest energy efficiency standards?
                </button>
                <button
                  onClick={() => append({ role: "user", content: "Find accessibility requirements for bathroom renovations" })}
                  className="p-3 text-sm border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  Find accessibility requirements for bathroom renovations
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "assistant" && message.experimental_attachments?.length > 0 && (
                <Sources>
                  <SourcesTrigger count={message.experimental_attachments.length} />
                  <SourcesContent>
                    {message.experimental_attachments.map((source: any, i: number) => (
                      <Source
                        key={i}
                        href={source.url || "#"}
                        title={source.title || source.name || "Reference"}
                      />
                    ))}
                  </SourcesContent>
                </Sources>
              )}

              <Message from={message.role}>
                <MessageContent>
                  <Response>{message.content}</Response>
                </MessageContent>
              </Message>
            </div>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask a question about codes, regulations, or industry standards..."
        />
        <PromptInputSubmit disabled={!input.trim()} status={status} />
      </PromptInput>
    </div>
  );
}

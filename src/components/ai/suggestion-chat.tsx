"use client";

import {
    Conversation,
    ConversationContent,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { Suggestion, Suggestions } from "@/components/ai/suggestion";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const starterPrompts = [
	"What can you help me with?",
	"Explain how AI works in simple terms",
	"Give me creative project ideas",
	"Help me learn something new today",
];

export default function SuggestionChat() {
	const [input, setInput] = useState("");
	const { messages, append, status } = useChat({
		api: "/api/suggestion",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			append({ role: "user", content: input });
			setInput("");
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		append({ role: "user", content: suggestion });
	};

	return (
		<div className="flex flex-col h-full max-w-4xl mx-auto">
			{messages.length === 0 && (
				<div className="flex flex-col items-center justify-center flex-1 p-8">
					<h2 className="text-2xl font-semibold mb-4">
						How can I help you today?
					</h2>
					<Suggestions>
						{starterPrompts.map((prompt) => (
							<Suggestion
								key={prompt}
								suggestion={prompt}
								onClick={handleSuggestionClick}
							/>
						))}
					</Suggestions>
				</div>
			)}

			{messages.length > 0 && (
				<Conversation>
					<ConversationContent>
						{messages.map((message) => (
							<Message from={message.role} key={message.id}>
								<MessageContent>
									<Response>{message.content}</Response>
								</MessageContent>
							</Message>
						))}
					</ConversationContent>
				</Conversation>
			)}

			<PromptInput onSubmit={handleSubmit}>
				<PromptInputTextarea
					value={input}
					onChange={(e) => setInput(e.currentTarget.value)}
					placeholder="Type your message..."
				/>
				<PromptInputSubmit disabled={!input.trim()} status={status} />
			</PromptInput>
		</div>
	);
}

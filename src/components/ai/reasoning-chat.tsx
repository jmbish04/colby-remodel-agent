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
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from "@/components/ai/reasoning";
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function ReasoningChat() {
	const [input, setInput] = useState("");
	const { messages, append, status } = useChat({
		api: "/api/reasoning",
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
					{messages.map((message) => (
						<Message from={message.role} key={message.id}>
							<MessageContent>
								{message.parts?.map((part, i) => {
									switch (part.type) {
										case "text":
											return (
												<Response key={`${message.id}-${i}`}>
													{part.text}
												</Response>
											);
										case "reasoning":
											return (
												<Reasoning
													key={`${message.id}-${i}`}
													isStreaming={status === "streaming"}
													defaultOpen={false}
												>
													<ReasoningTrigger />
													<ReasoningContent>{part.text}</ReasoningContent>
												</Reasoning>
											);
										default:
											return null;
									}
								})}
							</MessageContent>
						</Message>
					))}
				</ConversationContent>
			</Conversation>

			<PromptInput onSubmit={handleSubmit}>
				<PromptInputTextarea
					value={input}
					onChange={(e) => setInput(e.currentTarget.value)}
					placeholder="Ask me to reason through something..."
				/>
				<PromptInputSubmit disabled={!input.trim()} status={status} />
			</PromptInput>
		</div>
	);
}

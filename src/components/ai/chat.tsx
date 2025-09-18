"use client";

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai/conversation";
import { Loader } from "@/components/ai/loader";
import { Message, MessageContent } from "@/components/ai/message";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
	const [input, setInput] = useState("");
	const { messages, append, status } = useChat();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			append({ role: "user", content: input });
			setInput("");
		}
	};

	return (
		<div className="flex flex-col h-full">
			<Conversation>
				<ConversationContent>
					{messages.map((message) => (
						<Message from={message.role} key={message.id}>
							<MessageContent>
								<Response>{message.content}</Response>
							</MessageContent>
						</Message>
					))}
					{status === "streaming" && (
						<div className="flex items-center gap-2 p-4">
							<Loader size={20} />
							<span className="text-muted-foreground text-sm">Thinking...</span>
						</div>
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<PromptInput onSubmit={handleSubmit}>
				<PromptInputTextarea
					value={input}
					placeholder="Ask something..."
					onChange={(e) => setInput(e.currentTarget.value)}
				/>
				<PromptInputSubmit status={status} disabled={!input.trim()} />
			</PromptInput>
		</div>
	);
}

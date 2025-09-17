"use client";

import { Response } from "@/components/ai/response";
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from "@/components/ai/tool";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function ToolDemo() {
	const [input, setInput] = useState("");
	const { messages, append, status } = useChat({
		api: "/api/tools",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			append({ role: "user", content: input });
			setInput("");
		}
	};

	// Find tool calls in messages
	const toolCalls = messages.flatMap(
		(msg) => msg.parts?.filter((part) => part.type?.startsWith("tool-")) || [],
	);

	return (
		<div className="space-y-4 max-w-3xl mx-auto p-6">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask me to search, calculate, or fetch data..."
					className="flex-1 px-3 py-2 border rounded-lg"
				/>
				<Button type="submit" disabled={status === "streaming"}>
					Send
				</Button>
			</form>

			<div className="space-y-3">
				{toolCalls.map((tool, index) => (
					<Tool key={index} defaultOpen={tool.state === "output-available"}>
						<ToolHeader type={tool.type} state={tool.state} />
						<ToolContent>
							<ToolInput input={tool.input} />
							{tool.state === "output-available" && (
								<ToolOutput
									output={<Response>{tool.output}</Response>}
									errorText={tool.errorText}
								/>
							)}
						</ToolContent>
					</Tool>
				))}
			</div>
		</div>
	);
}

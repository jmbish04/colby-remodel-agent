"use client";

import {
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
} from "@/components/ai/task";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { z } from "zod";

const taskSchema = z.object({
	title: z.string(),
	items: z.array(
		z.object({
			type: z.enum(["text", "file"]),
			text: z.string(),
			file: z
				.object({
					name: z.string(),
					icon: z.string(),
				})
				.optional(),
		}),
	),
	status: z.enum(["pending", "in_progress", "completed"]),
});

const tasksSchema = z.object({
	tasks: z.array(taskSchema),
});

export default function TaskWorkflow() {
	const [prompt, setPrompt] = useState("");

	const { object, submit, isLoading } = useObject({
		api: "/api/task",
		schema: tasksSchema,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (prompt.trim()) {
			submit({ prompt });
			setPrompt("");
		}
	};

	return (
		<div className="space-y-4 max-w-2xl mx-auto p-6">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Describe a task..."
					className="flex-1 px-3 py-2 border rounded-lg"
				/>
				<button
					type="submit"
					disabled={isLoading}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
				>
					Generate Tasks
				</button>
			</form>

			{isLoading && !object && (
				<p className="text-muted-foreground">Generating workflow...</p>
			)}

			<div className="space-y-3">
				{object?.tasks?.map((task, index) => (
					<Task key={index} defaultOpen={index === 0}>
						<TaskTrigger title={task.title} />
						<TaskContent>
							{task.items?.map((item, i) => (
								<TaskItem key={i}>
									{item.type === "file" && item.file ? (
										<span>
											{item.text} <TaskItemFile>{item.file.name}</TaskItemFile>
										</span>
									) : (
										item.text
									)}
								</TaskItem>
							))}
						</TaskContent>
					</Task>
				))}
			</div>
		</div>
	);
}

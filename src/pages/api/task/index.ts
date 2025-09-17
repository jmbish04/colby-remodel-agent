import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import type { APIRoute } from "astro";
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

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const { prompt } = await request.json();

		// Get API key from environment
		const apiKey =
			locals.runtime?.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

		if (!apiKey) {
			return new Response(
				JSON.stringify({ error: "OpenAI API key not configured" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Initialize the OpenAI model
		const client = openai({
			apiKey: apiKey,
		});

		const result = await streamObject({
			model: client("gpt-4o"),
			schema: tasksSchema,
			prompt: `Generate a realistic task workflow for: ${prompt}

Include file operations, scanning steps, and progress indicators.
Make it feel like a real development workflow.`,
		});

		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Task API Error:", error);
		return new Response(JSON.stringify({ error: "Failed to generate tasks" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

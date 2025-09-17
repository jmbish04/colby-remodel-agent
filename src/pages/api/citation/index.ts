import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import type { APIRoute } from "astro";
import { z } from "zod";

const citationSchema = z.object({
	content: z.string(),
	citations: z.array(
		z.object({
			number: z.string(),
			title: z.string(),
			url: z.string(),
			description: z.string().optional(),
			quote: z.string().optional(),
		}),
	),
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
			schema: citationSchema,
			prompt: `Generate content about ${prompt} with proper citations marked as [1], [2], etc.`,
		});

		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Citation API Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process citation request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};

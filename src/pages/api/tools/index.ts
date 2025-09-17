import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import type { APIRoute } from "astro";
import { z } from "zod";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const { messages } = await request.json();

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

		const result = await streamText({
			model: client("gpt-4o"),
			messages: convertToModelMessages(messages),
			tools: {
				calculate: {
					description: "Perform mathematical calculations",
					parameters: z.object({
						expression: z.string().describe("Math expression to evaluate"),
					}),
					execute: async ({ expression }) => {
						// Simulate calculation
						const result = eval(expression); // Use a safe math parser in production
						return { expression, result };
					},
				},
				web_search: {
					description: "Search the web for information",
					parameters: z.object({
						query: z.string().describe("Search query"),
						limit: z.number().default(5).describe("Number of results"),
					}),
					execute: async ({ query, limit }) => {
						// Simulate web search
						await new Promise((resolve) => setTimeout(resolve, 1000));
						return {
							query,
							results: `Found ${limit} results for "${query}"`,
						};
					},
				},
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Tools API Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process tools request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};

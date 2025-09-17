import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import type { APIRoute } from "astro";

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
			model: client("gpt-4o"), // Using GPT-4o for reasoning capabilities
			system:
				"You are a helpful AI assistant with strong reasoning capabilities. When answering questions, show your step-by-step reasoning process before providing the final answer.",
			messages: convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse({
			sendReasoning: true, // Enable reasoning part streaming
		});
	} catch (error) {
		console.error("Reasoning API Error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process reasoning request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};

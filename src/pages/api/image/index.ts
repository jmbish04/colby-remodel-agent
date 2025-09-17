import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";
import type { APIRoute } from "astro";

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

		const { image } = await generateImage({
			model: client.image("dall-e-3"),
			prompt,
			size: "1024x1024",
		});

		// Return image data in a format suitable for the Image component
		return new Response(
			JSON.stringify({
				src: `data:${image.mediaType};base64,${image.base64}`,
				alt: "Generated image",
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Image generation API Error:", error);
		return new Response(JSON.stringify({ error: "Failed to generate image" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

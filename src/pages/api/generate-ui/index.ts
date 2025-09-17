import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { prompt } = await request.json();

    // For demo purposes, return a static URL
    // In a real implementation, you would integrate with a UI generation service
    // like v0, CodeSandbox API, or a custom generation service
    const generatedUrl = `https://generated-ui-preview.vercel.app/preview/${Date.now()}`;

    return new Response(
      JSON.stringify({
        url: generatedUrl,
        prompt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('UI Generation API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate UI' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

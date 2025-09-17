import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { messages } = await request.json();

    // Get API key from environment
    const apiKey = locals.runtime?.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize the OpenAI model
    const client = openai({
      apiKey: apiKey
    });
    
    const result = await streamText({
      model: client('gpt-4'),
      system: `You are a helpful AI assistant for the Colby Remodel Agent platform. 
      You specialize in home renovation and construction project management. 
      You can help users with:
      - Project planning and scheduling
      - Contractor recommendations and management
      - Budget estimation and tracking
      - Building codes and permits
      - Material selection and sourcing
      - Timeline management
      - Problem solving during renovations
      
      Always provide practical, actionable advice and be helpful in managing their renovation projects.`,
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

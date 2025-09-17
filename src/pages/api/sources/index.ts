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

    // Initialize the OpenAI model with source capabilities
    // Note: This is a placeholder - you'd typically integrate with a search API
    // like Perplexity, Tavily, or implement your own document search
    const client = openai({
      apiKey: apiKey
    });
    
    const result = await streamText({
      model: client('gpt-4'),
      system: `You are a helpful AI assistant for the Colby Remodel Agent platform that provides sources.
      You specialize in home renovation and construction project management.
      
      When answering questions, try to reference relevant sources such as:
      - Building codes and regulations
      - Industry best practices
      - Manufacturer guidelines
      - Professional contractor resources
      - Permit and inspection requirements
      
      Always provide helpful, accurate information with source attribution when possible.`,
      messages,
      experimental_providerMetadata: {
        openai: {
          // This would be where you'd implement source tracking
          // For now, we'll return mock sources
        },
      },
    });

    // Mock sources for demonstration - replace with actual source integration
    const mockSources = [
      {
        title: "International Building Code (IBC)",
        url: "https://codes.iccsafe.org/content/IBC2021P1",
      },
      {
        title: "National Association of Home Builders",
        url: "https://www.nahb.org/",
      },
      {
        title: "EPA Home Renovation Guidelines",
        url: "https://www.epa.gov/lead/renovation-repair-and-painting-program",
      },
    ];

    return result.toAIStreamResponse({
      sendSources: true,
      experimental_providerMetadata: {
        sources: mockSources,
      },
    });
  } catch (error) {
    console.error('Sources API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process sources request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

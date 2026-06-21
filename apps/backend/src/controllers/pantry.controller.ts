import { Request, Response } from 'express';
import { geminiClient } from '../lib/gemini.js';
import { parseTextRequestSchema, geminiParsedResponseSchema, createPantryItemsSchema } from '../schemas/pantry.js';
import { prisma } from '../lib/prisma.js';
import { clerkWrapper } from '../lib/clerk.js';

/**
 * Sanitizes raw string response from Gemini, removing markdown code blocks.
 */
export const sanitizeGeminiResponse = (rawResponse: string): string => {
  let cleaned = rawResponse.trim();
  
  // Remove markdown code block wrappers like ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  
  return cleaned.trim();
};

/**
 * Endpoint to parse user input free text into structured ingredients.
 * POST /api/v1/pantry/parse-text
 */
export const parseText = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    // Validate request payload
    const parsedRequest = parseTextRequestSchema.safeParse(req.body);
    if (!parsedRequest.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsedRequest.error.format()
      });
      return;
    }

    const { text } = parsedRequest.data;

    // Call Gemini API
    const response = await geminiClient.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction:
          'Você é um assistente especialista em culinária e organização de despensas. Extraia a lista de ingredientes e quantidades do texto fornecido pelo usuário. Ignore comentários, cabeçalhos ou termos não relacionados a ingredientes. Se o ingrediente não possuir quantidade explícita, use "a gosto" ou estime uma quantidade razoável.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            ingredients: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  quantity: { type: 'STRING' }
                },
                required: ['name', 'quantity']
              }
            }
          },
          required: ['ingredients']
        }
      }
    });

    const candidateText = response.text;
    if (!candidateText) {
      throw new Error('Gemini API returned an empty response');
    }

    // Sanitize and parse JSON
    const sanitizedText = sanitizeGeminiResponse(candidateText);
    
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(sanitizedText);
    } catch {
      console.error('Failed to parse Gemini response as JSON. Cleaned response:', sanitizedText);
      res.status(502).json({
        error: 'Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde.'
      });
      return;
    }

    // Validate Gemini response structure
    const validatedResponse = geminiParsedResponseSchema.safeParse(parsedJson);
    if (!validatedResponse.success) {
      console.error('Gemini response did not match schema:', validatedResponse.error.format());
      res.status(502).json({
        error: 'Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde.'
      });
      return;
    }

    res.status(200).json(validatedResponse.data);
  } catch (error: unknown) {
    console.error('Error in parseText controller:', error);

    // Detect rate limit (HTTP 429) errors from Gemini SDK
    const errorWithStatus = error as { status?: number; statusCode?: number };
    const isRateLimit =
      error instanceof Error &&
      (error.message.includes('429') ||
        error.message.toLowerCase().includes('resource_exhausted') ||
        error.message.toLowerCase().includes('quota') ||
        errorWithStatus.status === 429 ||
        errorWithStatus.statusCode === 429);

    if (isRateLimit) {
      res.status(429).json({
        error: 'Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes.'
      });
      return;
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Retrieves all pantry items for the authenticated user.
 * GET /api/v1/pantry
 */
export const getPantry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    const items = await prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Creates one or more pantry items for the authenticated user.
 * POST /api/v1/pantry/items
 */
export const createPantryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    const parsed = createPantryItemsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.format()
      });
      return;
    }

    const { items } = parsed.data;

    // Check if UserProfile exists for this userId. If not, auto-create a minimal profile to prevent foreign key errors.
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const secretKey = process.env.CLERK_SECRET_KEY;
      const clerkClient = clerkWrapper.createClerkClient({ secretKey });
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';

      await prisma.userProfile.create({
        data: {
          userId,
          email,
          calorieGoal: null,
          healthRestrictions: [],
          preferences: []
        }
      });
    }

    const createdItems = await prisma.$transaction(
      items.map((item) =>
        prisma.pantryItem.create({
          data: {
            userId,
            name: item.name,
            quantity: item.quantity ?? null
          }
        })
      )
    );

    res.status(201).json(createdItems);
  } catch (error) {
    console.error('Error creating pantry items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Deletes a single pantry item by ID, enforcing that it belongs to the authenticated user.
 * DELETE /api/v1/pantry/items/:id
 */
export const deletePantryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Missing item ID' });
      return;
    }

    const deleteResult = await prisma.pantryItem.deleteMany({
      where: {
        id,
        userId
      }
    });

    if (deleteResult.count === 0) {
      res.status(404).json({ error: 'Pantry item not found or unauthorized' });
      return;
    }

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

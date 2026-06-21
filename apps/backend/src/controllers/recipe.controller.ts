import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { geminiClient } from '../lib/gemini.js';
import { geminiRecipeResponseSchema } from '../schemas/recipe.js';

/**
 * Sanitizes raw string response from Gemini, removing markdown code blocks.
 */
export const sanitizeGeminiResponse = (rawResponse: string): string => {
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  return cleaned.trim();
};

/**
 * Normalizes text to remove accents (diacritics) for safer term checking.
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Checks if a normalized text contains a normalized forbidden term as a whole word/phrase.
 */
const containsForbiddenTerm = (text: string, term: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedTerm = normalizeText(term);
  const regex = new RegExp(`(^|[^a-zA-Z0-9áéíóúâêîôûãõç])(${normalizedTerm})([^a-zA-Z0-9áéíóúâêîôûãõç]|$)`, 'i');
  return regex.test(normalizedText);
};

// Forbidden terms mapping for health restrictions and dietary preferences
const forbiddenTermsMap: Record<string, string[]> = {
  'Sem Lactose': ['leite', 'manteiga', 'queijo', 'creme de leite', 'iogurte', 'requeijao', 'nata'],
  'Sem Glúten': ['trigo', 'centeio', 'cevada', 'aveia', 'farinha de trigo', 'pao', 'massa'],
  'Sem Ovo': ['ovo', 'gemas', 'claras', 'ovos'],
  'Alergia a Oleaginosas': ['castanha', 'amendoim', 'amendoa', 'nozes', 'avela', 'pistache', 'macadamia'],
  'Baixo Açúcar (Diabéticos)': ['acucar', 'mel', 'melaco', 'xarope', 'doce'],
  'Vegetariano': ['carne', 'frango', 'peixe', 'porco', 'bacon', 'presunto', 'salsicha', 'linguica', 'camarao', 'frutos do mar', 'bife'],
  'Vegano': ['carne', 'frango', 'peixe', 'porco', 'bacon', 'presunto', 'salsicha', 'linguica', 'camarao', 'frutos do mar', 'bife', 'leite', 'manteiga', 'queijo', 'creme de leite', 'iogurte', 'requeijao', 'nata', 'ovo', 'gemas', 'claras', 'ovos', 'mel']
};

/**
 * Controller to generate a recipe based on user pantry and profile settings.
 * POST /api/v1/recipes/generate
 */
export const generateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier' });
      return;
    }

    // 1. Fetch user's pantry items
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId }
    });

    if (pantryItems.length === 0) {
      res.status(400).json({
        error: 'Sua despensa está vazia. Adicione ingredientes antes de tentar gerar uma receita.'
      });
      return;
    }

    // 2. Fetch user's profile goals and health restrictions
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    const activeRestrictions: string[] = [
      ...(profile?.healthRestrictions || []),
      ...(profile?.preferences || [])
    ];

    const calorieGoal = profile?.calorieGoal;

    // 3. Construct prompt
    const pantryListString = pantryItems.map(item => `${item.name}${item.quantity ? ` (${item.quantity})` : ''}`).join(', ');

    const systemInstruction = `Você é um chef de cozinha profissional e especialista em nutrição.
Gere uma receita criativa, saborosa e realista baseada nos ingredientes fornecidos na despensa do usuário.

Diretrizes importantes:
1. Priorize o uso dos ingredientes informados da despensa.
2. Você pode sugerir ingredientes secundários extremamente comuns (sal, pimenta, água, azeite, óleo, cebola, alho), mas mantenha o foco principal nos itens da despensa fornecidos.
3. Respeite rigorosamente as seguintes restrições de saúde do usuário: ${activeRestrictions.join(', ') || 'Nenhuma'}.
4. Considere o objetivo de calorias diárias do usuário se fornecido: ${calorieGoal ? `${calorieGoal} kcal` : 'Não especificado'}.

Regras estritas para restrições de saúde (se presentes):
- Se 'Sem Lactose' estiver ativo, não use leite, manteiga, queijo com lactose, creme de leite, iogurte ou qualquer outro derivado de leite de origem animal.
- Se 'Sem Glúten' estiver ativo, não use farinha de trigo, cevada, centeio, aveia comum ou qualquer produto com glúten.
- Se 'Sem Ovo' estiver ativo, não use ovos ou derivados em nenhuma etapa.
- Se 'Alergia a Oleaginosas' estiver ativo, não use nozes, castanhas, amendoim, amêndoas ou derivados.
- Se 'Baixo Açúcar (Diabéticos)' estiver ativo, evite açúcar refinado, mel, excesso de carboidratos simples ou doces.

Regras estritas para preferências (se presentes):
- Se 'Vegetariano' estiver ativo, não use nenhuma carne animal (carne bovina, suína, frango, peixe, frutos do mar).
- Se 'Vegano' estiver ativo, não use nenhum ingrediente de origem animal (carnes, ovos, laticínios, mel).
- Se 'Low Carb' estiver ativo, evite ou reduza drasticamente carboidratos refinados, arroz, massas e tubérculos ricos em amido.

Estime as calorias e macronutrientes de forma realista e conservadora baseando-se estritamente na porção dos ingredientes recomendados.`;

    const promptText = `Ingredientes disponíveis na despensa: ${pantryListString}
Gere a receita recomendada respeitando as restrições alimentares e metas especificadas.`;

    // 4. Call Gemini API
    const geminiResponse = await geminiClient.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            description: { type: 'STRING' },
            calories: { type: 'INTEGER' },
            macros: {
              type: 'OBJECT',
              properties: {
                carbohydrates: { type: 'STRING' },
                proteins: { type: 'STRING' },
                fats: { type: 'STRING' }
              },
              required: ['carbohydrates', 'proteins', 'fats']
            },
            ingredientsUsed: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            },
            steps: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['title', 'description', 'calories', 'macros', 'ingredientsUsed', 'steps']
        }
      }
    });

    const candidateText = geminiResponse.text;
    if (!candidateText) {
      throw new Error('Gemini API returned an empty response');
    }

    const sanitizedText = sanitizeGeminiResponse(candidateText);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error(JSON.stringify({
        event: 'RECIPE_PARSE_FAILED',
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: sanitizedText
      }));
      res.status(502).json({
        error: 'Não foi possível interpretar a receita sugerida no momento. Por favor, tente gerar outra sugestão.'
      });
      return;
    }

    // 5. Validate output structure with Zod
    const validated = geminiRecipeResponseSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error(JSON.stringify({
        event: 'RECIPE_SCHEMA_MISMATCH',
        errors: validated.error.format(),
        response: parsedJson
      }));
      res.status(502).json({
        error: 'Não foi possível interpretar a receita sugerida no momento. Por favor, tente gerar outra sugestão.'
      });
      return;
    }

    const recipe = validated.data;

    // 6. Post-generation safety validation: Scan for forbidden terms
    for (const restriction of activeRestrictions) {
      const forbiddenTerms = forbiddenTermsMap[restriction];
      if (forbiddenTerms) {
        for (const term of forbiddenTerms) {
          // Check title
          if (containsForbiddenTerm(recipe.title, term)) {
            console.error(JSON.stringify({ event: 'SAFETY_VIOLATION_DETECTED', restriction, term, field: 'title', value: recipe.title }));
            res.status(502).json({ error: 'A receita sugerida violou as restrições alimentares de segurança do seu perfil. Por favor, tente gerar novamente.' });
            return;
          }
          // Check description
          if (containsForbiddenTerm(recipe.description, term)) {
            console.error(JSON.stringify({ event: 'SAFETY_VIOLATION_DETECTED', restriction, term, field: 'description', value: recipe.description }));
            res.status(502).json({ error: 'A receita sugerida violou as restrições alimentares de segurança do seu perfil. Por favor, tente gerar novamente.' });
            return;
          }
          // Check ingredients used
          for (const ingredient of recipe.ingredientsUsed) {
            if (containsForbiddenTerm(ingredient, term)) {
              console.error(JSON.stringify({ event: 'SAFETY_VIOLATION_DETECTED', restriction, term, field: 'ingredientsUsed', value: ingredient }));
              res.status(502).json({ error: 'A receita sugerida violou as restrições alimentares de segurança do seu perfil. Por favor, tente gerar novamente.' });
              return;
            }
          }
          // Check instructions
          for (const step of recipe.steps) {
            if (containsForbiddenTerm(step, term)) {
              console.error(JSON.stringify({ event: 'SAFETY_VIOLATION_DETECTED', restriction, term, field: 'steps', value: step }));
              res.status(502).json({ error: 'A receita sugerida violou as restrições alimentares de segurança do seu perfil. Por favor, tente gerar novamente.' });
              return;
            }
          }
        }
      }
    }

    res.status(200).json(recipe);
  } catch (error: unknown) {
    console.error(JSON.stringify({
      event: 'RECIPE_GENERATION_ERROR',
      error: error instanceof Error ? error.message : String(error)
    }));

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

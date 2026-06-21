import { z } from 'zod';

export const parseTextRequestSchema = z.object({
  text: z
    .string()
    .min(1, 'O texto de ingredientes não pode estar vazio.')
    .max(5000, 'O texto é muito longo (máximo 5000 caracteres).')
});

export const parsedIngredientSchema = z.object({
  name: z.string().min(1).toLowerCase(),
  quantity: z.string().min(1)
});

export const geminiParsedResponseSchema = z.object({
  ingredients: z.array(parsedIngredientSchema)
});

export type ParseTextRequest = z.infer<typeof parseTextRequestSchema>;
export type ParsedIngredient = z.infer<typeof parsedIngredientSchema>;
export type GeminiParsedResponse = z.infer<typeof geminiParsedResponseSchema>;

export const createPantryItemsSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().trim().min(1, 'O nome do ingrediente é obrigatório.').toLowerCase(),
      quantity: z.string().trim().optional().nullable()
    })
  ).min(1, 'Pelo menos um ingrediente deve ser fornecido.')
});

export type CreatePantryItems = z.infer<typeof createPantryItemsSchema>;

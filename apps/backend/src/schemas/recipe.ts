import { z } from 'zod';

export const recipeMacrosSchema = z.object({
  carbohydrates: z.string().trim().min(1, 'Carboidratos são obrigatórios.'),
  proteins: z.string().trim().min(1, 'Proteínas são obrigatórias.'),
  fats: z.string().trim().min(1, 'Gorduras são obrigatórias.')
});

export const geminiRecipeResponseSchema = z.object({
  title: z.string().trim().min(1, 'O título da receita é obrigatório.'),
  description: z.string().trim().min(1, 'A descrição da receita é obrigatória.'),
  calories: z.number().int().nonnegative('Calorias devem ser um número não negativo.'),
  macros: recipeMacrosSchema,
  ingredientsUsed: z.array(z.string().trim().min(1)).min(1, 'Pelo menos um ingrediente deve ser listado como utilizado.'),
  steps: z.array(z.string().trim().min(1)).min(1, 'Pelo menos um passo de instrução deve ser listado.')
});

export type RecipeMacros = z.infer<typeof recipeMacrosSchema>;
export type GeminiRecipeResponse = z.infer<typeof geminiRecipeResponseSchema>;

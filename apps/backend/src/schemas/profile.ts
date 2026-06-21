import { z } from 'zod';

export const updateProfileSchema = z.object({
  calorieGoal: z
    .number()
    .int()
    .min(500, 'A meta calórica deve ser de pelo menos 500 kcal.')
    .max(10000, 'A meta calórica não deve ultrapassar 10000 kcal.')
    .nullable()
    .optional(),
  healthRestrictions: z.array(
    z.enum([
      'Sem Lactose',
      'Sem Glúten',
      'Baixo Açúcar',
      'Sem Ovo',
      'Alergia a Oleaginosas'
    ])
  ),
  preferences: z.array(
    z.enum([
      'Vegetariano',
      'Vegano',
      'Low Carb'
    ])
  )
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

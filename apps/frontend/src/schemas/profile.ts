import { z } from 'zod';

export const profileFormSchema = z.object({
  calorieGoal: z
    .union([
      z.number()
        .int('A meta calórica deve ser um número inteiro.')
        .min(500, 'A meta calórica deve ser de pelo menos 500 kcal.')
        .max(10000, 'A meta calórica não deve ultrapasar 10000 kcal.'),
      z.nan(),
      z.literal('')
    ])
    .transform((val) => {
      if (val === '' || Number.isNaN(val)) return null;
      return val;
    })
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

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileFormInput = {
  calorieGoal: string | number;
  healthRestrictions: string[];
  preferences: string[];
};
export const HEALTH_RESTRICTIONS_OPTIONS = [
  'Sem Lactose',
  'Sem Glúten',
  'Baixo Açúcar',
  'Sem Ovo',
  'Alergia a Oleaginosas'
] as const;

export const PREFERENCES_OPTIONS = [
  'Vegetariano',
  'Vegano',
  'Low Carb'
] as const;

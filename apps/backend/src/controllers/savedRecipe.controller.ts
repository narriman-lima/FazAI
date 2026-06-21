import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const favoriteRecipeSchema = z.object({
  title: z.string().min(1),
  calories: z.number().int().nonnegative(),
  carbohydrates: z.string().min(1),
  proteins: z.string().min(1),
  fats: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
  steps: z.array(z.string()).min(1),
});

// ─── POST /api/v1/recipes/favorite ──────────────────────────────────────────

export const favoriteRecipe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parsed = favoriteRecipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { title, calories, carbohydrates, proteins, fats, ingredients, steps } = parsed.data;

  try {
    const savedRecipe = await prisma.savedRecipe.create({
      data: { userId, title, calories, carbohydrates, proteins, fats, ingredients, steps },
    });

    console.log(JSON.stringify({ event: 'recipe_favorited', userId, recipeId: savedRecipe.id }));
    res.status(201).json(savedRecipe);
  } catch (err) {
    console.error(JSON.stringify({ event: 'recipe_favorite_error', userId, error: String(err) }));
    res.status(500).json({ error: 'Erro ao salvar receita' });
  }
};

// ─── GET /api/v1/recipes/history ────────────────────────────────────────────

export const getRecipeHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const recipes = await prisma.savedRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(JSON.stringify({ event: 'recipe_history_fetched', userId, count: recipes.length }));
    res.status(200).json(recipes);
  } catch (err) {
    console.error(JSON.stringify({ event: 'recipe_history_error', userId, error: String(err) }));
    res.status(500).json({ error: 'Erro ao buscar histórico de receitas' });
  }
};

// ─── DELETE /api/v1/recipes/favorite/:id ────────────────────────────────────

export const unfavoriteRecipe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    // Use deleteMany with compound filter to prevent IDOR silently
    await prisma.savedRecipe.deleteMany({
      where: { id, userId },
    });

    console.log(JSON.stringify({ event: 'recipe_unfavorited', userId, recipeId: id }));
    res.status(204).end();
  } catch (err) {
    console.error(JSON.stringify({ event: 'recipe_unfavorite_error', userId, recipeId: id, error: String(err) }));
    res.status(500).json({ error: 'Erro ao remover receita' });
  }
};

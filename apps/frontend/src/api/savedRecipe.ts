import { Recipe } from './recipe.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SavedRecipe {
  id: string;
  title: string;
  calories: number;
  carbohydrates: string;
  proteins: string;
  fats: string;
  ingredients: string[];
  steps: string[];
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getBackendUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Saves (favorites) a generated recipe for the authenticated user.
 */
export const favoriteRecipe = async (token: string, recipe: Recipe): Promise<SavedRecipe> => {
  const backendUrl = getBackendUrl();

  const payload = {
    title: recipe.title,
    calories: recipe.calories,
    carbohydrates: recipe.macros.carbohydrates,
    proteins: recipe.macros.proteins,
    fats: recipe.macros.fats,
    ingredients: recipe.ingredientsUsed,
    steps: recipe.steps,
  };

  const response = await fetch(`${backendUrl}/api/v1/recipes/favorite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData.error || 'Erro ao favoritar receita. Tente novamente.');
  }

  return response.json() as Promise<SavedRecipe>;
};

/**
 * Retrieves the full recipe history for the authenticated user.
 */
export const getRecipeHistory = async (token: string): Promise<SavedRecipe[]> => {
  const backendUrl = getBackendUrl();

  const response = await fetch(`${backendUrl}/api/v1/recipes/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    throw new Error('Erro ao carregar o histórico de receitas. Tente novamente.');
  }

  return response.json() as Promise<SavedRecipe[]>;
};

/**
 * Removes (unfavorites) a saved recipe for the authenticated user.
 * Uses deleteMany on the backend to prevent IDOR — always returns 204.
 */
export const unfavoriteRecipe = async (token: string, id: string): Promise<void> => {
  const backendUrl = getBackendUrl();

  const response = await fetch(`${backendUrl}/api/v1/recipes/favorite/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    if (response.status === 401) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    throw new Error('Erro ao remover receita. Tente novamente.');
  }
};

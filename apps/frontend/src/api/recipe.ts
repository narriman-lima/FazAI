export interface RecipeMacros {
  carbohydrates: string;
  proteins: string;
  fats: string;
}

export interface Recipe {
  title: string;
  description: string;
  calories: number;
  macros: RecipeMacros;
  ingredientsUsed: string[];
  steps: string[];
}

const getBackendUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const generateRecipe = async (token: string): Promise<Recipe> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/recipes/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errorData.error || 'Adicione ingredientes à sua despensa antes de gerar uma receita.');
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes.');
    }
    if (response.status === 502) {
      const errorData = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errorData.error || 'Ocorreu um erro ao gerar sua receita. Por favor, tente novamente.');
    }
    if (response.status === 401) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData.error || 'Ocorreu um erro ou limite atingido ao gerar sua receita. Por favor, tente novamente em alguns instantes.');
  }

  return response.json() as Promise<Recipe>;
};

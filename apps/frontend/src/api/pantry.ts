export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedIngredient {
  name: string;
  quantity: string;
}

const getBackendUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const getPantry = async (token: string): Promise<PantryItem[]> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/pantry`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar itens da despensa.');
  }

  return response.json() as Promise<PantryItem[]>;
};

export const parsePantryText = async (token: string, text: string): Promise<ParsedIngredient[]> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/pantry/parse-text`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes.');
    }
    if (response.status === 502) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde.');
    }
    throw new Error('Erro ao processar texto com a IA.');
  }

  const data = await response.json() as { ingredients: ParsedIngredient[] };
  return data.ingredients;
};

export const createPantryItems = async (
  token: string,
  items: Array<{ name: string; quantity: string | null }>
): Promise<PantryItem[]> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/pantry/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });

  if (!response.ok) {
    throw new Error('Erro ao salvar os itens na despensa.');
  }

  return response.json() as Promise<PantryItem[]>;
};

export const deletePantryItem = async (token: string, id: string): Promise<{ success: boolean; message: string }> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/pantry/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir o ingrediente.');
  }

  return response.json() as Promise<{ success: boolean; message: string }>;
};

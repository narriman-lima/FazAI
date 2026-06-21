export interface UserProfile {
  id: string;
  userId: string;
  calorieGoal: number | null;
  healthRestrictions: string[];
  preferences: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

const getBackendUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const getProfile = async (token: string): Promise<UserProfile> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Por favor, tente novamente em alguns instantes.');
    }
    throw new Error('Ocorreu um erro ao carregar as configurações do seu perfil. Por favor, tente novamente mais tarde.');
  }

  return response.json() as Promise<UserProfile>;
};

export const updateProfile = async (
  token: string,
  data: {
    calorieGoal: number | null;
    healthRestrictions: string[];
    preferences: string[];
  }
): Promise<UserProfile> => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/v1/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Por favor, tente novamente em alguns instantes.');
    }
    if (response.status === 400) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Dados inválidos inseridos. Por favor, verifique os campos.');
    }
    throw new Error('Ocorreu um erro ao salvar as configurações do seu perfil. Por favor, tente novamente.');
  }

  return response.json() as Promise<UserProfile>;
};

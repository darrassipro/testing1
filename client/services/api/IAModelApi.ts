const BASE_URL = process.env.NEXT_PUBLIC_SERVER_DOMAIN || 'http://localhost:8080';

export interface IAModel {
  id: number;
  provider: string;
  models_list: string[];
  selected_model: string | null;
  api_key: string | null;
  api_endpoint: string | null;
  prompt: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguages: string[];
  providerId?: number;
}

export interface TranslationResponse {
  translations: {
    [key: string]: string;
  };
  provider: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const IAModelApi = {
  // Get all IA models
  getAll: async (): Promise<IAModel[]> => {
    const response = await fetch(`${BASE_URL}/api/ia-models`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch IA models');
    return response.json();
  },

  // Get single IA model
  getById: async (id: number): Promise<IAModel> => {
    const response = await fetch(`${BASE_URL}/api/ia-models/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch IA model');
    return response.json();
  },

  // Get default IA model
  getDefault: async (): Promise<IAModel> => {
    const response = await fetch(`${BASE_URL}/api/ia-models/default`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch default IA model');
    return response.json();
  },

  // Create new IA model
  create: async (data: Partial<IAModel>): Promise<IAModel> => {
    const response = await fetch(`${BASE_URL}/api/ia-models`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create IA model');
    return response.json();
  },

  // Update IA model
  update: async (id: number, data: Partial<IAModel>): Promise<IAModel> => {
    const response = await fetch(`${BASE_URL}/api/ia-models/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update IA model');
    return response.json();
  },

  // Delete IA model
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/ia-models/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete IA model');
  },

  // Translate text
  translate: async (request: TranslationRequest): Promise<TranslationResponse> => {
    const response = await fetch(`${BASE_URL}/api/ia-models/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to translate text');
    return response.json();
  }
};

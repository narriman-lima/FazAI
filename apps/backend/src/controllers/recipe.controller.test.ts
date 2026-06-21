import { test, mock } from 'node:test';
import assert from 'node:assert';
import { Request, Response } from 'express';
import { geminiClient } from '../lib/gemini.js';
import { prisma } from '../lib/prisma.js';
import * as recipeController from './recipe.controller.js';

interface StatusError extends Error {
  status?: number;
  statusCode?: number;
}

test('Recipe Controller', async (t) => {
  await t.test('sanitizeGeminiResponse - cleans markdown formatting', () => {
    const rawInput = '```json\n{\n  "title": "Suco"\n}\n```';
    const cleaned = recipeController.sanitizeGeminiResponse(rawInput);
    assert.strictEqual(cleaned, '{\n  "title": "Suco"\n}');
  });

  await t.test('generateRecipe - successfully generates recipe from pantry', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    const mockPantryItems = [
      { id: 'item_1', name: 'ovo', quantity: '3', userId: 'user_123', createdAt: new Date(), updatedAt: new Date() },
      { id: 'item_2', name: 'espinafre', quantity: '1 maço', userId: 'user_123', createdAt: new Date(), updatedAt: new Date() }
    ];

    const mockProfile = {
      id: 'profile_1',
      userId: 'user_123',
      email: 'user@example.com',
      calorieGoal: 300,
      healthRestrictions: ['Sem Lactose'],
      preferences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockRecipeResponse = {
      title: 'Omelete Fit de Espinafre',
      description: 'Um delicioso omelete sem lactose',
      calories: 220,
      macros: {
        carbohydrates: '4g',
        proteins: '16g',
        fats: '12g'
      },
      ingredientsUsed: ['3 ovos', '1 maço de espinafre'],
      steps: ['Bata os ovos', 'Refogue o espinafre', 'Doure dos dois lados']
    };

    // Mock prisma.pantryItem.findMany
    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async (args: { where: { userId: string } }) => {
        assert.strictEqual(args.where.userId, 'user_123');
        return mockPantryItems;
      },
      writable: true,
      configurable: true
    });

    // Mock prisma.userProfile.findUnique
    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async (args: { where: { userId: string } }) => {
        assert.strictEqual(args.where.userId, 'user_123');
        return mockProfile;
      },
      writable: true,
      configurable: true
    });

    // Mock Gemini API
    const mockGenerate = mock.method(geminiClient, 'generateContent', async (params: { model: string; contents: string; config?: { systemInstruction?: string } }) => {
      assert.strictEqual(params.model, 'gemini-2.5-flash');
      assert.ok(params.contents.includes('ovo'));
      assert.ok(params.config?.systemInstruction?.includes('Sem Lactose'));
      assert.ok(params.config?.systemInstruction?.includes('300 kcal'));
      return { text: JSON.stringify(mockRecipeResponse) } as unknown as ReturnType<typeof geminiClient.generateContent>;
    });

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await recipeController.generateRecipe(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.deepStrictEqual(jsonCalledWith, mockRecipeResponse);
    } finally {
      delete (prisma.pantryItem as unknown as Record<string, unknown>).findMany;
      delete (prisma.userProfile as unknown as Record<string, unknown>).findUnique;
      mockGenerate.mock.restore();
    }
  });

  await t.test('generateRecipe - rejects when auth user context is missing', async () => {
    const req = {} as unknown as Request;

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    await recipeController.generateRecipe(req, res);
    assert.strictEqual(statusCalledWith, 401);
    assert.deepStrictEqual(jsonCalledWith, { error: 'Unauthorized: Missing user identifier' });
  });

  await t.test('generateRecipe - returns 400 when pantry is empty', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async () => [],
      writable: true,
      configurable: true
    });

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await recipeController.generateRecipe(req, res);
      assert.strictEqual(statusCalledWith, 400);
      const typedResponse = jsonCalledWith as { error: string };
      assert.ok(typedResponse.error.includes('Sua despensa está vazia'));
    } finally {
      delete (prisma.pantryItem as unknown as Record<string, unknown>).findMany;
    }
  });

  await t.test('generateRecipe - handles Gemini 429 rate limit exception', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    const rateLimitError = new Error('ResourceExhausted: Quota exceeded (429)') as StatusError;
    rateLimitError.status = 429;

    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async () => [{ id: 'item_1', name: 'ovo' }],
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => null,
      writable: true,
      configurable: true
    });

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      throw rateLimitError;
    });

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await recipeController.generateRecipe(req, res);
      assert.strictEqual(statusCalledWith, 429);
      assert.deepStrictEqual(jsonCalledWith, {
        error: 'Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes.'
      });
    } finally {
      delete (prisma.pantryItem as unknown as Record<string, unknown>).findMany;
      delete (prisma.userProfile as unknown as Record<string, unknown>).findUnique;
      mockGenerate.mock.restore();
    }
  });

  await t.test('generateRecipe - handles malformed JSON response with 502 Bad Gateway', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async () => [{ id: 'item_1', name: 'ovo' }],
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => null,
      writable: true,
      configurable: true
    });

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      return { text: 'Not JSON' } as unknown as ReturnType<typeof geminiClient.generateContent>;
    });

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await recipeController.generateRecipe(req, res);
      assert.strictEqual(statusCalledWith, 502);
      const typedResponse = jsonCalledWith as { error: string };
      assert.ok(typedResponse.error.includes('Não foi possível interpretar a receita'));
    } finally {
      delete (prisma.pantryItem as unknown as Record<string, unknown>).findMany;
      delete (prisma.userProfile as unknown as Record<string, unknown>).findUnique;
      mockGenerate.mock.restore();
    }
  });

  await t.test('generateRecipe - blocks recipe generation if it violates active health restrictions (lactose term)', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    const mockPantryItems = [{ id: 'item_1', name: 'ovo' }];
    const mockProfile = {
      id: 'profile_1',
      userId: 'user_123',
      email: 'user@example.com',
      calorieGoal: null,
      healthRestrictions: ['Sem Lactose'],
      preferences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // The model hallucinates dairy ingredients (manteiga) despite Sem Lactose restriction
    const mockViolatingRecipe = {
      title: 'Omelete Violador',
      description: 'Uma receita simples',
      calories: 300,
      macros: {
        carbohydrates: '5g',
        proteins: '15g',
        fats: '15g'
      },
      ingredientsUsed: ['3 ovos', '1 colher de manteiga'],
      steps: ['Frite o omelete na manteiga quente']
    };

    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async () => mockPantryItems,
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => mockProfile,
      writable: true,
      configurable: true
    });

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      return { text: JSON.stringify(mockViolatingRecipe) } as unknown as ReturnType<typeof geminiClient.generateContent>;
    });

    let jsonCalledWith: unknown = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: unknown) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await recipeController.generateRecipe(req, res);
      assert.strictEqual(statusCalledWith, 502);
      const typedResponse = jsonCalledWith as { error: string };
      assert.ok(typedResponse.error.includes('violou as restrições alimentares de segurança'));
    } finally {
      delete (prisma.pantryItem as unknown as Record<string, unknown>).findMany;
      delete (prisma.userProfile as unknown as Record<string, unknown>).findUnique;
      mockGenerate.mock.restore();
    }
  });
});

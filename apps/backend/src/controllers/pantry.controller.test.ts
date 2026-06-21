import { test, mock } from 'node:test';
import assert from 'node:assert';
import { Request, Response } from 'express';
import { geminiClient } from '../lib/gemini.js';
import { prisma } from '../lib/prisma.js';
import { clerkWrapper } from '../lib/clerk.js';
import * as pantryController from './pantry.controller.js';

test('Pantry Controller', async (t) => {
  await t.test('sanitizeGeminiResponse - cleans markdown formatting', () => {
    const rawInput = '```json\n{\n  "ingredients": []\n}\n```';
    const cleaned = pantryController.sanitizeGeminiResponse(rawInput);
    assert.strictEqual(cleaned, '{\n  "ingredients": []\n}');
  });

  await t.test('sanitizeGeminiResponse - cleans raw markdown without json label', () => {
    const rawInput = '```\n{\n  "ingredients": []\n}\n```';
    const cleaned = pantryController.sanitizeGeminiResponse(rawInput);
    assert.strictEqual(cleaned, '{\n  "ingredients": []\n}');
  });

  await t.test('parseText - successfully parses ingredients list', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: { text: '3 ovos\n1 maço de espinafre' }
    } as unknown as Request;

    const mockApiResponse = {
      text: '```json\n{\n  "ingredients": [\n    { "name": "ovo", "quantity": "3 unidades" },\n    { "name": "espinafre", "quantity": "1 maço" }\n  ]\n}\n```'
    };

    const mockGenerate = mock.method(geminiClient, 'generateContent', async (params: any) => {
      assert.strictEqual(params.model, 'gemini-2.5-flash');
      assert.strictEqual(params.contents, '3 ovos\n1 maço de espinafre');
      return mockApiResponse as any;
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.parseText(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.deepStrictEqual(jsonCalledWith, {
        ingredients: [
          { name: 'ovo', quantity: '3 unidades' },
          { name: 'espinafre', quantity: '1 maço' }
        ]
      });
    } finally {
      mockGenerate.mock.restore();
    }
  });

  await t.test('parseText - rejects when auth user context is missing', async () => {
    const req = {
      body: { text: '3 ovos' }
    } as unknown as Request;

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    await pantryController.parseText(req, res);
    assert.strictEqual(statusCalledWith, 401);
    assert.strictEqual(jsonCalledWith.error, 'Unauthorized: Missing user identifier');
  });

  await t.test('parseText - rejects when payload is missing text', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {}
    } as unknown as Request;

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    await pantryController.parseText(req, res);
    assert.strictEqual(statusCalledWith, 400);
    assert.strictEqual(jsonCalledWith.error, 'Validation Error');
  });

  await t.test('parseText - handles rate-limit 429 exception gracefully', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: { text: '3 ovos' }
    } as unknown as Request;

    const rateLimitError = new Error('ResourceExhausted: Quota exceeded (429)');
    (rateLimitError as any).status = 429;

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      throw rateLimitError;
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.parseText(req, res);
      assert.strictEqual(statusCalledWith, 429);
      assert.strictEqual(
        jsonCalledWith.error,
        'Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes.'
      );
    } finally {
      mockGenerate.mock.restore();
    }
  });

  await t.test('parseText - handles malformed JSON response with 502 Bad Gateway', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: { text: '3 ovos' }
    } as unknown as Request;

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      return { text: 'This is not JSON at all' } as any;
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.parseText(req, res);
      assert.strictEqual(statusCalledWith, 502);
      assert.strictEqual(
        jsonCalledWith.error,
        'Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde.'
      );
    } finally {
      mockGenerate.mock.restore();
    }
  });

  await t.test('parseText - handles schema mismatch response with 502 Bad Gateway', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: { text: '3 ovos' }
    } as unknown as Request;

    const mockGenerate = mock.method(geminiClient, 'generateContent', async () => {
      // Missing required ingredients array or fields inside it are named incorrectly
      return { text: '{"not_ingredients": []}' } as any;
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.parseText(req, res);
      assert.strictEqual(statusCalledWith, 502);
      assert.strictEqual(
        jsonCalledWith.error,
        'Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde.'
      );
    } finally {
      mockGenerate.mock.restore();
    }
  });

  await t.test('getPantry - returns existing pantry items', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    const mockItems = [
      { id: 'item_1', name: 'ovo', quantity: '3', userId: 'user_123', createdAt: new Date(), updatedAt: new Date() },
      { id: 'item_2', name: 'espinafre', quantity: '1 maço', userId: 'user_123', createdAt: new Date(), updatedAt: new Date() }
    ];

    Object.defineProperty(prisma.pantryItem, 'findMany', {
      value: async (args: any) => {
        assert.strictEqual(args.where.userId, 'user_123');
        return mockItems;
      },
      writable: true,
      configurable: true
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.getPantry(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.deepStrictEqual(jsonCalledWith, mockItems);
    } finally {
      delete (prisma.pantryItem as any).findMany;
    }
  });

  await t.test('getPantry - rejects when auth user context is missing', async () => {
    const req = {} as unknown as Request;
    let jsonCalledWith: any = null;
    let statusCalledWith = 0;
    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    await pantryController.getPantry(req, res);
    assert.strictEqual(statusCalledWith, 401);
    assert.strictEqual(jsonCalledWith.error, 'Unauthorized: Missing user identifier');
  });

  await t.test('createPantryItems - successfully creates items in bulk', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        items: [
          { name: 'ovo', quantity: '3' },
          { name: 'espinafre', quantity: '1 maço' }
        ]
      }
    } as unknown as Request;

    const mockProfile = { id: 'profile_uuid', userId: 'user_123', email: 'user@example.com' };
    const mockCreatedItems = [
      { id: 'item_1', name: 'ovo', quantity: '3', userId: 'user_123' },
      { id: 'item_2', name: 'espinafre', quantity: '1 maço', userId: 'user_123' }
    ];

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => mockProfile,
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.pantryItem, 'create', {
      value: async (args: any) => {
        const item = mockCreatedItems.find(i => i.name === args.data.name);
        return item;
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma, '$transaction', {
      value: async (promises: Promise<any>[]) => {
        return Promise.all(promises);
      },
      writable: true,
      configurable: true
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.createPantryItems(req, res);
      assert.strictEqual(statusCalledWith, 201);
      assert.deepStrictEqual(jsonCalledWith, mockCreatedItems);
    } finally {
      delete (prisma.userProfile as any).findUnique;
      delete (prisma.pantryItem as any).create;
      delete (prisma as any).$transaction;
    }
  });

  await t.test('createPantryItems - auto-creates user profile if missing', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        items: [{ name: 'ovo', quantity: '3' }]
      }
    } as unknown as Request;

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => null,
      writable: true,
      configurable: true
    });

    let profileCreated = false;
    Object.defineProperty(prisma.userProfile, 'create', {
      value: async (args: any) => {
        assert.strictEqual(args.data.userId, 'user_123');
        assert.strictEqual(args.data.email, 'clerk@example.com');
        profileCreated = true;
        return { id: 'new_profile', ...args.data };
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.pantryItem, 'create', {
      value: async (args: any) => {
        return { id: 'new_item', ...args.data };
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma, '$transaction', {
      value: async (promises: Promise<any>[]) => {
        return Promise.all(promises);
      },
      writable: true,
      configurable: true
    });

    const mockClerkUser = { emailAddresses: [{ emailAddress: 'clerk@example.com' }] };
    const mockClerkClientInstance = {
      users: {
        getUser: async (userId: string) => {
          assert.strictEqual(userId, 'user_123');
          return mockClerkUser;
        }
      }
    };
    const mockCreateClerkClient = mock.method(clerkWrapper, 'createClerkClient', () => {
      return mockClerkClientInstance as any;
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.createPantryItems(req, res);
      assert.strictEqual(statusCalledWith, 201);
      assert.strictEqual(profileCreated, true);
      assert.strictEqual(jsonCalledWith[0].id, 'new_item');
    } finally {
      delete (prisma.userProfile as any).findUnique;
      delete (prisma.userProfile as any).create;
      delete (prisma.pantryItem as any).create;
      delete (prisma as any).$transaction;
      mockCreateClerkClient.mock.restore();
    }
  });

  await t.test('createPantryItems - rejects invalid payload', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        items: []
      }
    } as unknown as Request;

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    await pantryController.createPantryItems(req, res);
    assert.strictEqual(statusCalledWith, 400);
    assert.strictEqual(jsonCalledWith.error, 'Validation Error');
  });

  await t.test('deletePantryItem - successfully deletes owned item', async () => {
    const req = {
      auth: { userId: 'user_123' },
      params: { id: 'item_123' }
    } as unknown as Request;

    Object.defineProperty(prisma.pantryItem, 'deleteMany', {
      value: async (args: any) => {
        assert.strictEqual(args.where.id, 'item_123');
        assert.strictEqual(args.where.userId, 'user_123');
        return { count: 1 };
      },
      writable: true,
      configurable: true
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.deletePantryItem(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.deepStrictEqual(jsonCalledWith, { success: true, message: 'Item deleted successfully' });
    } finally {
      delete (prisma.pantryItem as any).deleteMany;
    }
  });

  await t.test('deletePantryItem - returns 404 when item is not found or owned by another user', async () => {
    const req = {
      auth: { userId: 'user_123' },
      params: { id: 'item_456' }
    } as unknown as Request;

    Object.defineProperty(prisma.pantryItem, 'deleteMany', {
      value: async (args: any) => {
        assert.strictEqual(args.where.id, 'item_456');
        assert.strictEqual(args.where.userId, 'user_123');
        return { count: 0 };
      },
      writable: true,
      configurable: true
    });

    let jsonCalledWith: any = null;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: any) {
        jsonCalledWith = body;
      }
    } as unknown as Response;

    try {
      await pantryController.deletePantryItem(req, res);
      assert.strictEqual(statusCalledWith, 404);
      assert.strictEqual(jsonCalledWith.error, 'Pantry item not found or unauthorized');
    } finally {
      delete (prisma.pantryItem as any).deleteMany;
    }
  });
});

import { test, mock } from 'node:test';
import assert from 'node:assert';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { clerkWrapper } from '../lib/clerk.js';
import * as profileController from './profile.controller.js';

test('Profile Controller', async (t) => {
  await t.test('getProfile - returns existing profile', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    const mockProfile = {
      id: 'profile_uuid',
      userId: 'user_123',
      email: 'user@example.com',
      calorieGoal: 2000,
      healthRestrictions: ['Sem Lactose'],
      preferences: ['Vegano'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async (args: any) => {
        assert.strictEqual(args.where.userId, 'user_123');
        return mockProfile;
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
      await profileController.getProfile(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.deepStrictEqual(jsonCalledWith, mockProfile);
    } finally {
      delete (prisma.userProfile as any).findUnique;
    }
  });

  await t.test('getProfile - returns defaults when profile does not exist', async () => {
    const req = {
      auth: { userId: 'user_123' }
    } as unknown as Request;

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => {
        return null;
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
      await profileController.getProfile(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.strictEqual(jsonCalledWith.calorieGoal, null);
      assert.deepStrictEqual(jsonCalledWith.healthRestrictions, []);
      assert.deepStrictEqual(jsonCalledWith.preferences, []);
    } finally {
      delete (prisma.userProfile as any).findUnique;
    }
  });

  await t.test('updateProfile - updates existing profile', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        calorieGoal: 2500,
        healthRestrictions: ['Sem Glúten'],
        preferences: ['Low Carb']
      }
    } as unknown as Request;

    const mockProfile = {
      id: 'profile_uuid',
      userId: 'user_123',
      email: 'user@example.com',
      calorieGoal: 2000,
      healthRestrictions: ['Sem Lactose'],
      preferences: ['Vegano']
    };

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => {
        return mockProfile;
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.userProfile, 'update', {
      value: async (args: any) => {
        assert.strictEqual(args.where.userId, 'user_123');
        assert.strictEqual(args.data.calorieGoal, 2500);
        assert.deepStrictEqual(args.data.healthRestrictions, ['Sem Glúten']);
        assert.deepStrictEqual(args.data.preferences, ['Low Carb']);
        return { ...mockProfile, ...args.data };
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
      await profileController.updateProfile(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.strictEqual(jsonCalledWith.calorieGoal, 2500);
      assert.deepStrictEqual(jsonCalledWith.healthRestrictions, ['Sem Glúten']);
    } finally {
      delete (prisma.userProfile as any).findUnique;
      delete (prisma.userProfile as any).update;
    }
  });

  await t.test('updateProfile - creates profile with email from Clerk if not exists', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        calorieGoal: 2200,
        healthRestrictions: ['Sem Lactose'],
        preferences: ['Vegano']
      }
    } as unknown as Request;

    Object.defineProperty(prisma.userProfile, 'findUnique', {
      value: async () => {
        return null;
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(prisma.userProfile, 'create', {
      value: async (args: any) => {
        assert.strictEqual(args.data.userId, 'user_123');
        assert.strictEqual(args.data.email, 'clerk@example.com');
        assert.strictEqual(args.data.calorieGoal, 2200);
        return { id: 'new_uuid', ...args.data };
      },
      writable: true,
      configurable: true
    });

    const mockClerkUser = {
      emailAddresses: [{ emailAddress: 'clerk@example.com' }]
    };
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
      await profileController.updateProfile(req, res);
      assert.strictEqual(statusCalledWith, 200);
      assert.strictEqual(jsonCalledWith.email, 'clerk@example.com');
      assert.strictEqual(jsonCalledWith.calorieGoal, 2200);
    } finally {
      delete (prisma.userProfile as any).findUnique;
      delete (prisma.userProfile as any).create;
      mockCreateClerkClient.mock.restore();
    }
  });

  await t.test('updateProfile - rejects invalid calorie goal', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        calorieGoal: 200, // too low, min 500
        healthRestrictions: [],
        preferences: []
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

    await profileController.updateProfile(req, res);
    assert.strictEqual(statusCalledWith, 400);
    assert.strictEqual(jsonCalledWith.error, 'Validation Error');
  });

  await t.test('updateProfile - rejects invalid health restriction name', async () => {
    const req = {
      auth: { userId: 'user_123' },
      body: {
        calorieGoal: 1500,
        healthRestrictions: ['Some Invalid Restriction'],
        preferences: []
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

    await profileController.updateProfile(req, res);
    assert.strictEqual(statusCalledWith, 400);
    assert.strictEqual(jsonCalledWith.error, 'Validation Error');
  });
});

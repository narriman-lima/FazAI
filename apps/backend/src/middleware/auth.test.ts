import { test, mock } from 'node:test';
import assert from 'node:assert';
import { Request, Response } from 'express';
import * as authMiddleware from './auth.js';


test('extractToken utility', () => {
  assert.strictEqual(authMiddleware.extractToken(undefined), null);
  assert.strictEqual(authMiddleware.extractToken(''), null);
  assert.strictEqual(authMiddleware.extractToken('Basic abc'), null);
  assert.strictEqual(authMiddleware.extractToken('Bearer'), null);
  assert.strictEqual(authMiddleware.extractToken('Bearer token123'), 'token123');
  assert.strictEqual(authMiddleware.extractToken('bearer token456'), 'token456');
});

test('requireAuth middleware', async (t) => {
  // Mock process.env.CLERK_SECRET_KEY
  const originalSecretKey = process.env.CLERK_SECRET_KEY;
  process.env.CLERK_SECRET_KEY = 'sk_test_mock';

  t.after(() => {
    process.env.CLERK_SECRET_KEY = originalSecretKey;
  });

  await t.test('returns 401 when token is missing', async () => {
    const req = {
      headers: {},
    } as unknown as Request;

    let jsonCalled = false;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: Record<string, string>) {
        jsonCalled = true;
        assert.deepStrictEqual(body, { error: 'Unauthorized: Missing or invalid token format' });
      }
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await authMiddleware.requireAuth(req, res, next);

    assert.strictEqual(statusCalledWith, 401);
    assert.strictEqual(jsonCalled, true);
    assert.strictEqual(nextCalled, false);
  });

  await t.test('returns 401 when token verification fails', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    } as unknown as Request;

    let jsonCalled = false;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: Record<string, string>) {
        jsonCalled = true;
        assert.deepStrictEqual(body, { error: 'Unauthorized: Invalid token' });
      }
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Mock verifier.verify to throw an error
    const mockVerifyToken = mock.method(authMiddleware.verifier, 'verify', async () => {
      throw new Error('Invalid signature');
    });

    try {
      await authMiddleware.requireAuth(req, res, next);
    } finally {
      mockVerifyToken.mock.restore();
    }

    assert.strictEqual(statusCalledWith, 401);
    assert.strictEqual(jsonCalled, true);
    assert.strictEqual(nextCalled, false);
  });

  await t.test('returns 401 when payload does not contain sub', async () => {
    const req = {
      headers: {
        authorization: 'Bearer valid_token_no_sub',
      },
    } as unknown as Request;

    let jsonCalled = false;
    let statusCalledWith = 0;

    const res = {
      status(code: number) {
        statusCalledWith = code;
        return this;
      },
      json(body: Record<string, string>) {
        jsonCalled = true;
        assert.deepStrictEqual(body, { error: 'Unauthorized: Missing user identifier in token' });
      }
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Mock verifier.verify to return payload without sub
    const mockVerifyToken = mock.method(authMiddleware.verifier, 'verify', async () => {
      return {};
    });

    try {
      await authMiddleware.requireAuth(req, res, next);
    } finally {
      mockVerifyToken.mock.restore();
    }

    assert.strictEqual(statusCalledWith, 401);
    assert.strictEqual(jsonCalled, true);
    assert.strictEqual(nextCalled, false);
  });

  await t.test('passes and sets req.auth when token is valid', async () => {
    const req = {
      headers: {
        authorization: 'Bearer valid_token',
      },
      auth: undefined,
    } as unknown as Request;

    const res = {} as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Mock verifier.verify to return valid payload
    const mockVerifyToken = mock.method(authMiddleware.verifier, 'verify', async () => {
      return { sub: 'user_12345' };
    });

    try {
      await authMiddleware.requireAuth(req, res, next);
    } finally {
      mockVerifyToken.mock.restore();
    }

    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(req.auth, { userId: 'user_12345' });
  });
});

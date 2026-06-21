import { Request, Response, NextFunction } from 'express';
import * as clerk from '@clerk/backend';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
      };
    }
  }
}

/**
 * Extracts the JWT token from the Authorization header.
 * Expected format: "Bearer <token>"
 */
export const extractToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  return parts[1];
};

/**
 * Wrapper object for Clerk token verification to facilitate mocking in ESM.
 */
export const verifier = {
  verify: async (token: string, secretKey: string) => {
    return clerk.verifyToken(token, { secretKey });
  }
};

/**
 * Express middleware that validates the Clerk session token (JWT)
 * and populates req.auth.userId.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error('CLERK_SECRET_KEY is not defined in environment variables');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const payload = await verifier.verify(token, secretKey);
    
    if (!payload.sub) {
      res.status(401).json({ error: 'Unauthorized: Missing user identifier in token' });
      return;
    }

    req.auth = {
      userId: payload.sub,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

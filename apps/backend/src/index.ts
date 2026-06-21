import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.js';
import profileRouter from './routes/profile.js';
import pantryRouter from './routes/pantry.js';
import recipeRouter from './routes/recipe.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn('[Backend] Warning: GEMINI_API_KEY is not defined in environment variables.');
}

const app = express();
const port = process.env.PORT || process.env.BACKEND_PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Profile routes
app.use('/api/v1/profile', profileRouter);

// Pantry routes
app.use('/api/v1/pantry', pantryRouter);

// Recipe routes
app.use('/api/v1/recipes', recipeRouter);

// Auth verification endpoint
app.get('/api/v1/auth-status', requireAuth, (req, res) => {
  res.status(200).json({
    authenticated: true,
    userId: req.auth?.userId,
  });
});

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Listen on the configured port
app.listen(port, () => {
  console.log(`[Backend] FazAI Backend initialized on port ${port}`);
});

export default app;

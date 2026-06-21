import { Router } from 'express';
import { generateRecipe } from '../controllers/recipe.controller.js';
import { favoriteRecipe, getRecipeHistory, unfavoriteRecipe } from '../controllers/savedRecipe.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/generate', requireAuth, generateRecipe);
router.post('/favorite', requireAuth, favoriteRecipe);
router.get('/history', requireAuth, getRecipeHistory);
router.delete('/favorite/:id', requireAuth, unfavoriteRecipe);

export default router;

import { Router } from 'express';
import { parseText, getPantry, createPantryItems, deletePantryItem } from '../controllers/pantry.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/parse-text', requireAuth, parseText);
router.get('/', requireAuth, getPantry);
router.post('/items', requireAuth, createPantryItems);
router.delete('/items/:id', requireAuth, deletePantryItem);

export default router;

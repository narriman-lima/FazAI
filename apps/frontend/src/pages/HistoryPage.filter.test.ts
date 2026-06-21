/**
 * Unit tests for the client-side recipe history filtering logic.
 * Run with: npx vitest run (after adding vitest to devDependencies)
 *
 * Install: npm install -D vitest --workspace apps/frontend
 */
import { describe, it, expect } from 'vitest';
import type { SavedRecipe } from '../api/savedRecipe.js';

// Pure filtering function extracted from HistoryPage for testability
const filterRecipes = (recipes: SavedRecipe[], searchTerm: string): SavedRecipe[] => {
  if (!searchTerm.trim()) return recipes;
  return recipes.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeRecipe = (title: string, id: string = title): SavedRecipe => ({
  id,
  title,
  calories: 300,
  carbohydrates: '40',
  proteins: '20',
  fats: '10',
  ingredients: ['ovo', 'sal'],
  steps: ['Quebre o ovo', 'Frite'],
  createdAt: new Date().toISOString(),
});

const recipes: SavedRecipe[] = [
  makeRecipe('Omelete de Frango', '1'),
  makeRecipe('Macarrão ao Molho', '2'),
  makeRecipe('Salada de Atum', '3'),
  makeRecipe('Omelete de Legumes', '4'),
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('filterRecipes (client-side history search)', () => {
  it('returns all recipes when search term is empty', () => {
    expect(filterRecipes(recipes, '')).toHaveLength(4);
  });

  it('returns all recipes when search term is only whitespace', () => {
    expect(filterRecipes(recipes, '   ')).toHaveLength(4);
  });

  it('filters case-insensitively — lowercase term matches mixed-case title', () => {
    const result = filterRecipes(recipes, 'omelete');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '4']);
  });

  it('filters case-insensitively — uppercase term matches mixed-case title', () => {
    const result = filterRecipes(recipes, 'MACARRÃO');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns empty array when no recipe matches the search term', () => {
    const result = filterRecipes(recipes, 'lasanha');
    expect(result).toHaveLength(0);
  });

  it('returns all recipes again after clearing search term', () => {
    const filtered = filterRecipes(recipes, 'atum');
    expect(filtered).toHaveLength(1);
    const all = filterRecipes(recipes, '');
    expect(all).toHaveLength(4);
  });

  it('matches partial terms inside the title', () => {
    const result = filterRecipes(recipes, 'molh');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

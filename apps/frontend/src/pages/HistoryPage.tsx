import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Search, BookOpen } from 'lucide-react';
import { SavedRecipe, getRecipeHistory, unfavoriteRecipe } from '../api/savedRecipe.js';
import RecipeHistoryCard from '../components/RecipeHistoryCard.js';
import RecipeDetailModal from '../components/RecipeDetailModal.js';

interface HistoryPageProps {
  navigate: (path: string) => void;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function HistoryCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3">
      <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-16 bg-slate-100 rounded-full" />
        ))}
      </div>
      <div className="h-3 w-24 bg-slate-100 rounded-full" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HistoryPage({ navigate }: HistoryPageProps): React.JSX.Element {
  const { getToken } = useAuth();

  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sessão expirada. Faça login novamente.');
      const data = await getRecipeHistory(token);
      setRecipes(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao carregar o histórico. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      await unfavoriteRecipe(token, id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Silent failure — recipe stays in list; user can retry
    }
  };

  const filteredRecipes = searchTerm.trim()
    ? recipes.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recipes;

  const hasNoResults = !isLoading && !errorMessage && filteredRecipes.length === 0;
  const isEmpty = !isLoading && !errorMessage && recipes.length === 0 && !searchTerm.trim();

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Minhas Receitas</h1>
        <p className="mt-1 text-sm text-slate-500">Receitas que você favoritou e preparou</p>
      </header>

      {/* Search bar */}
      {!isLoading && !errorMessage && recipes.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="input-recipe-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar receitas..."
            className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 focus:border-[#ff6b6b] transition-colors"
          />
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <HistoryCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error state */}
      {!isLoading && errorMessage && (
        <div className="space-y-4">
          <div
            role="alert"
            className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl p-5 shadow-sm"
          >
            <span className="text-red-500 text-xl leading-none select-none">⚠</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            id="btn-retry-history"
            onClick={() => void fetchHistory()}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#ff6b6b] text-slate-700 hover:text-[#ff6b6b] font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 active:scale-95 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty state — no recipes saved yet */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-4xl select-none">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700">Nenhuma receita favoritada ainda</p>
            <p className="mt-1 text-sm text-slate-400">
              Gere uma receita e clique em "Favoritar" para ela aparecer aqui
            </p>
          </div>
          <button
            id="btn-go-to-recipes"
            onClick={() => navigate('/recipes')}
            className="mt-2 inline-flex items-center gap-2 bg-[#ff6b6b] hover:bg-[#e55a5a] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95"
          >
            Gerar uma Receita
          </button>
        </div>
      )}

      {/* No search results */}
      {hasNoResults && !isEmpty && (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma receita encontrada para{' '}
            <span className="font-semibold text-slate-700">"{searchTerm}"</span>
          </p>
          <button
            id="btn-clear-search"
            onClick={() => setSearchTerm('')}
            className="mt-3 text-sm text-[#ff6b6b] hover:underline font-medium"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Recipe grid */}
      {!isLoading && !errorMessage && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeHistoryCard
              key={recipe.id}
              recipe={recipe}
              onDelete={(id) => void handleDelete(id)}
              onClick={(r) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      )}

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

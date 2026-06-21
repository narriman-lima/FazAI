import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, RefreshCw, Heart } from 'lucide-react';
import { generateRecipe, Recipe } from '../api/recipe.js';
import { favoriteRecipe } from '../api/savedRecipe.js';

interface RecipeDetailsProps {
  navigate: (path: string) => void;
}

// ─────────────────────────────────────────────
// Skeleton sub-component
// ─────────────────────────────────────────────
function RecipeSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse w-full max-w-4xl mx-auto space-y-8" aria-label="Carregando receita..." aria-busy="true">
      {/* Back link skeleton */}
      <div className="h-4 w-40 bg-slate-200 rounded-full" />

      {/* Title skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-5/6 bg-slate-100 rounded-lg" />
      </div>

      {/* Macro grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-7 w-12 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Ingredients skeleton */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-3">
        <div className="h-5 w-40 bg-slate-200 rounded-lg" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-slate-100 rounded-lg" style={{ width: `${60 + i * 8}%` }} />
        ))}
      </div>

      {/* Steps skeleton */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="h-7 w-7 flex-shrink-0 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded-lg" style={{ width: `${70 + (i % 3) * 10}%` }} />
              {i % 2 === 0 && <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="h-12 w-full sm:w-72 bg-slate-200 rounded-xl" />
        <div className="h-12 w-full sm:flex-1 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MacroCard sub-component
// ─────────────────────────────────────────────
interface MacroCardProps {
  label: string;
  value: string | number;
  unit: string;
}

function MacroCard({ label, value, unit }: MacroCardProps): React.JSX.Element {
  return (
    <article className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {value ?? '—'}
        <span className="text-sm font-medium text-slate-500 ml-1">{unit}</span>
      </p>
    </article>
  );
}

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default function RecipeDetails({ navigate }: RecipeDetailsProps): React.JSX.Element {
  const { getToken } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async () => {
    setRecipe(null);
    setIsLoading(true);
    setErrorMessage(null);
    setIsFavorited(false);
    setFavoriteMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      const data = await generateRecipe(token);
      setRecipe(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ou limite atingido ao gerar sua receita. Por favor, tente novamente em alguns instantes.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Fetch recipe on mount
  useEffect(() => {
    void fetchRecipe();
  }, [fetchRecipe]);

  const handleRegenerate = () => {
    void fetchRecipe();
  };

  const handleFavorite = async () => {
    if (!recipe || isFavorited || isSaving) return;
    setIsSaving(true);
    setFavoriteError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sessão expirada.');
      await favoriteRecipe(token, recipe);
      setIsFavorited(true);
      setFavoriteMessage('Receita favoritada e marcada como preparada! 🎉');
      setTimeout(() => setFavoriteMessage(null), 4000);
    } catch (err) {
      setFavoriteError(
        err instanceof Error ? err.message : 'Erro ao favoritar receita. Tente novamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      {/* Back navigation */}
      <nav className="mb-6">
        <button
          onClick={() => navigate('/pantry')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#ff6b6b] transition-colors"
          aria-label="Voltar para a Despensa"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Despensa
        </button>
      </nav>

      {/* Skeleton loading */}
      {isLoading && <RecipeSkeleton />}

      {/* Error state */}
      {!isLoading && errorMessage && (
        <div className="space-y-6">
          <div
            role="alert"
            className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl p-5 shadow-sm"
          >
            <span className="text-red-500 text-xl leading-none select-none">⚠</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            id="btn-retry-generate"
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#ff6b6b] text-slate-700 hover:text-[#ff6b6b] font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Recipe success state */}
      {!isLoading && !errorMessage && recipe && (
        <main className="space-y-8">

          {/* Favorite success feedback */}
          {favoriteMessage && (
            <div
              role="status"
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-4 shadow-sm text-sm font-semibold"
            >
              <span>✓</span> {favoriteMessage}
            </div>
          )}

          {favoriteError && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 shadow-sm text-sm font-medium"
            >
              <span className="text-red-500 text-xl leading-none select-none">⚠</span>
              <p>{favoriteError}</p>
            </div>
          )}

          {/* Recipe header */}
          <header>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {recipe.title}
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              {recipe.description}
            </p>
          </header>

          {/* Nutritional macro grid */}
          <section aria-labelledby="macros-heading">
            <h2 id="macros-heading" className="text-lg font-semibold text-slate-800 mb-3">
              Informações Nutricionais
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MacroCard label="Calorias" value={recipe.calories ?? 0} unit="kcal" />
              <MacroCard label="Carboidratos" value={recipe.macros?.carbohydrates ?? '0'} unit="g" />
              <MacroCard label="Proteínas" value={recipe.macros?.proteins ?? '0'} unit="g" />
              <MacroCard label="Gorduras" value={recipe.macros?.fats ?? '0'} unit="g" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              * Valores estimados pelo modelo de IA com base nas porções dos ingredientes utilizados.
            </p>
          </section>

          {/* Ingredients list */}
          <section
            aria-labelledby="ingredients-heading"
            className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm"
          >
            <h2 id="ingredients-heading" className="text-lg font-semibold text-slate-800 mb-4">
              Ingredientes Utilizados
            </h2>
            <ul className="space-y-2">
              {recipe.ingredientsUsed.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#ff6b6b] font-bold mt-px select-none">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Preparation steps */}
          <section
            aria-labelledby="steps-heading"
            className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm"
          >
            <h2 id="steps-heading" className="text-lg font-semibold text-slate-800 mb-4">
              Modo de Preparo
            </h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ff6b6b] text-white text-xs font-bold leading-none"
                    aria-label={`Passo ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <button
              id="btn-favorite-recipe"
              onClick={() => { void handleFavorite(); }}
              disabled={isFavorited || isSaving}
              className="inline-flex items-center justify-center gap-2 bg-[#ff6b6b] hover:bg-[#e55a5a] active:scale-95 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none sm:flex-1"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-white' : ''}`} />
              {isSaving ? 'Salvando...' : isFavorited ? 'Favoritada!' : 'Favoritar e Marcar como Preparada'}
            </button>

            <button
              id="btn-regenerate-recipe"
              onClick={handleRegenerate}
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 font-medium px-6 py-3 rounded-xl shadow-sm transition-all duration-200 sm:flex-1"
            >
              <RefreshCw className="h-4 w-4" />
              Gerar Outra Sugestão
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

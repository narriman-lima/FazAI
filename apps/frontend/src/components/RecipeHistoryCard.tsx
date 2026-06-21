import React from 'react';
import { Trash2 } from 'lucide-react';
import { SavedRecipe } from '../api/savedRecipe.js';

interface RecipeHistoryCardProps {
  recipe: SavedRecipe;
  onDelete: (id: string) => void;
  onClick: (recipe: SavedRecipe) => void;
}

export default function RecipeHistoryCard({
  recipe,
  onDelete,
  onClick,
}: RecipeHistoryCardProps): React.JSX.Element {
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(recipe.id);
  };

  return (
    <article
      className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer group relative"
      onClick={() => onClick(recipe)}
      aria-label={`Receita: ${recipe.title}`}
    >
      {/* Delete button */}
      <button
        id={`btn-delete-recipe-${recipe.id}`}
        onClick={handleDeleteClick}
        aria-label={`Remover ${recipe.title} do histórico`}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-[#ff6b6b] hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Recipe title */}
      <h3 className="text-base font-semibold text-slate-900 leading-tight pr-8 mb-3">
        {recipe.title}
      </h3>

      {/* Macro badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center text-xs font-medium bg-slate-50 border border-slate-100 text-slate-600 rounded-full px-2.5 py-1">
          🔥 {recipe.calories} kcal
        </span>
        <span className="inline-flex items-center text-xs font-medium bg-slate-50 border border-slate-100 text-slate-600 rounded-full px-2.5 py-1">
          🌾 {recipe.carbohydrates}g carb
        </span>
        <span className="inline-flex items-center text-xs font-medium bg-slate-50 border border-slate-100 text-slate-600 rounded-full px-2.5 py-1">
          💪 {recipe.proteins}g prot
        </span>
        <span className="inline-flex items-center text-xs font-medium bg-slate-50 border border-slate-100 text-slate-600 rounded-full px-2.5 py-1">
          🥑 {recipe.fats}g gord
        </span>
      </div>

      {/* Date */}
      <p className="text-xs text-slate-400">
        {new Date(recipe.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </article>
  );
}

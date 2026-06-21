import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SavedRecipe } from '../api/savedRecipe.js';

interface RecipeDetailModalProps {
  recipe: SavedRecipe;
  onClose: () => void;
}

function MacroCard({ label, value, unit }: { label: string; value: string | number; unit: string }): React.JSX.Element {
  return (
    <article className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {value}
        <span className="text-sm font-medium text-slate-500 ml-1">{unit}</span>
      </p>
    </article>
  );
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps): React.JSX.Element {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900 leading-tight pr-4">
            {recipe.title}
          </h2>
          <button
            id="btn-close-recipe-modal"
            onClick={onClose}
            aria-label="Fechar detalhes da receita"
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Macros */}
          <section aria-labelledby="modal-macros-heading">
            <h3 id="modal-macros-heading" className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Informações Nutricionais
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MacroCard label="Calorias" value={recipe.calories} unit="kcal" />
              <MacroCard label="Carboidratos" value={recipe.carbohydrates} unit="g" />
              <MacroCard label="Proteínas" value={recipe.proteins} unit="g" />
              <MacroCard label="Gorduras" value={recipe.fats} unit="g" />
            </div>
          </section>

          {/* Ingredients */}
          <section
            aria-labelledby="modal-ingredients-heading"
            className="bg-white border border-slate-100 rounded-xl p-5"
          >
            <h3 id="modal-ingredients-heading" className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Ingredientes Utilizados
            </h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#ff6b6b] font-bold mt-px select-none">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section
            aria-labelledby="modal-steps-heading"
            className="bg-white border border-slate-100 rounded-xl p-5"
          >
            <h3 id="modal-steps-heading" className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Modo de Preparo
            </h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ff6b6b] text-white text-xs font-bold leading-none"
                    aria-label={`Passo ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getProfile, updateProfile } from '../api/profile.js';
import {
  profileFormSchema,
  HEALTH_RESTRICTIONS_OPTIONS,
  PREFERENCES_OPTIONS
} from '../schemas/profile.js';

interface ProfileSettingsProps {
  navigate: (path: string) => void;
}

export default function ProfileSettings({ navigate }: ProfileSettingsProps): React.JSX.Element {
  const { getToken, isLoaded: isAuthLoaded } = useAuth();

  // State variables
  const [calorieGoal, setCalorieGoal] = useState<string>('');
  const [healthRestrictions, setHealthRestrictions] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch profile on mount
  useEffect(() => {
    let active = true;

    const fetchInitialProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Não autenticado.');
        }
        const profile = await getProfile(token);
        if (active) {
          setCalorieGoal(profile.calorieGoal !== null && profile.calorieGoal !== undefined ? String(profile.calorieGoal) : '');
          setHealthRestrictions(profile.healthRestrictions || []);
          setPreferences(profile.preferences || []);
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'Erro ao carregar perfil.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (isAuthLoaded) {
      fetchInitialProfile();
    }

    return () => {
      active = false;
    };
  }, [getToken, isAuthLoaded]);

  const handleRestrictionChange = (option: string) => {
    setHealthRestrictions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handlePreferenceChange = (option: string) => {
    setPreferences((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setValidationErrors({});

    try {
      const parsedCalorie = calorieGoal.trim() === '' ? '' : Number(calorieGoal);
      
      // Validate form payload using Zod
      const parsedResult = profileFormSchema.safeParse({
        calorieGoal: parsedCalorie,
        healthRestrictions,
        preferences
      });

      if (!parsedResult.success) {
        const errors: Record<string, string> = {};
        const formatted = parsedResult.error.format();
        if (formatted.calorieGoal?._errors) {
          errors.calorieGoal = formatted.calorieGoal._errors[0];
        }
        setValidationErrors(errors);
        setIsSaving(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      await updateProfile(token, {
        calorieGoal: parsedResult.data.calorieGoal ?? null,
        healthRestrictions: parsedResult.data.healthRestrictions,
        preferences: parsedResult.data.preferences
      });
      setSuccessMessage('Perfil e configurações salvos com sucesso!');
      
      // Auto-dismiss success alert after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao salvar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b6b]"></div>
        <p className="mt-4 text-slate-500 font-medium">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/pantry')}
          className="text-[#ff6b6b] hover:text-[#e55a5a] text-sm font-medium transition-colors duration-200 flex items-center"
        >
          ← Voltar para Despensa
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Configurações de Saúde</h1>
      </div>

      {successMessage && (
        <div className="mb-6 text-emerald-500 bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-sm font-semibold flex items-center shadow-sm">
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 text-red-500 bg-red-50 border border-red-100 p-4 rounded-lg text-sm font-semibold flex items-center shadow-sm">
          ⚠ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Calorie Goal */}
        <section className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Metas Alimentares</h2>
            <p className="text-xs text-slate-400 mb-4">
              Informe suas metas para que possamos gerar recomendações nutricionais adequadas.
            </p>
          </header>
          
          <div className="space-y-2">
            <label htmlFor="calorieGoal" className="block text-sm font-medium text-slate-700">
              Meta Calórica Diária (kcal)
            </label>
            <input
              type="number"
              id="calorieGoal"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              placeholder="Ex: 2000 (Opcional)"
              className={`w-full px-3 py-2 bg-white border ${
                validationErrors.calorieGoal ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[#ff6b6b] focus:border-[#ff6b6b]'
              } rounded-lg outline-none focus:ring-2 text-slate-800 transition-all`}
            />
            {validationErrors.calorieGoal && (
              <span className="block text-xs font-semibold text-red-500 mt-1">
                {validationErrors.calorieGoal}
              </span>
            )}
          </div>
        </section>

        {/* Card 2: Health Restrictions */}
        <section className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Restrições de Saúde / Alergias</h2>
            <p className="text-xs text-slate-400 mb-4">
              Selecione as restrições alimentares que você possui para filtrarmos ingredientes nocivos.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEALTH_RESTRICTIONS_OPTIONS.map((option) => {
              const isChecked = healthRestrictions.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isChecked
                      ? 'border-[#ff6b6b] bg-red-50/20 text-slate-800 font-medium'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRestrictionChange(option)}
                    className="h-4 w-4 rounded border-slate-200 text-[#ff6b6b] focus:ring-[#ff6b6b] accent-[#ff6b6b]"
                  />
                  <span className="text-sm select-none">{option}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Card 3: Food Preferences */}
        <section className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
          <header>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Preferências Alimentares</h2>
            <p className="text-xs text-slate-400 mb-4">
              Informe as suas escolhas alimentares ou dietas específicas.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREFERENCES_OPTIONS.map((option) => {
              const isChecked = preferences.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isChecked
                      ? 'border-[#ff6b6b] bg-red-50/20 text-slate-800 font-medium'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePreferenceChange(option)}
                    className="h-4 w-4 rounded border-slate-200 text-[#ff6b6b] focus:ring-[#ff6b6b] accent-[#ff6b6b]"
                  />
                  <span className="text-sm select-none">{option}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] active:scale-95 text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Salvando Perfil...</span>
            </>
          ) : (
            <span>Salvar Perfil e Configurações</span>
          )}
        </button>
      </form>
    </div>
  );
}

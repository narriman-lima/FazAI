import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Trash2, Loader2, Sparkles } from 'lucide-react';
import { 
  getPantry, 
  parsePantryText, 
  createPantryItems, 
  deletePantryItem, 
  PantryItem 
} from '../api/pantry.js';

interface PantryDashboardProps {
  navigate: (path: string) => void;
}

export default function PantryDashboard({ navigate }: PantryDashboardProps): React.JSX.Element {
  const { getToken } = useAuth();
  
  // State variables
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [inputText, setInputText] = useState<string>('');
  
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial pantry items on component load
  useEffect(() => {
    let active = true;

    const fetchInitialData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Sessão inválida ou usuário não autenticado.');
        }
        const items = await getPantry(token);
        if (active) {
          setPantryItems(items);
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'Erro ao carregar itens da despensa.');
        }
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      active = false;
    };
  }, [getToken]);

  const handleProcessText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (inputText.length > 5000) {
      setErrorMessage('O texto é muito longo (máximo 5000 caracteres).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Step 1: Parse the input text using Gemini backend parser
      const parsedIngredients = await parsePantryText(token, inputText);

      if (parsedIngredients.length === 0) {
        setErrorMessage('Nenhum ingrediente foi detectado no texto fornecido. Tente descrever seus ingredientes de forma mais direta.');
        setIsLoading(false);
        return;
      }

      // Step 2: Persist the parsed ingredients into the user's pantry
      const savedItems = await createPantryItems(token, parsedIngredients);

      // Reactively add the newly saved items to the list
      setPantryItems((prev) => [...savedItems, ...prev]);
      setInputText('');
      setSuccessMessage('Alimentos processados e adicionados à sua despensa!');

      // Automatically clear success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ocorreu um erro ao processar seus alimentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      await deletePantryItem(token, id);
      setPantryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao excluir ingrediente.');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 w-full">
        <Loader2 className="animate-spin h-12 w-12 text-[#ff6b6b]" />
        <p className="mt-4 text-slate-500 font-medium">Carregando despensa...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Despensa Inteligente</h1>
        <p className="mt-2 text-sm text-slate-500">
          Adicione alimentos usando linguagem natural e gerencie seu inventário para evitar desperdícios.
        </p>
      </header>

      {/* Alert Feedbacks */}
      {successMessage && (
        <div className="mb-6 text-emerald-600 bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-sm font-semibold flex items-center shadow-sm">
          <span className="mr-2">✓</span> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 text-red-600 bg-red-50 border border-red-100 p-4 rounded-lg text-sm font-semibold flex items-center shadow-sm">
          <span className="mr-2">⚠</span> {errorMessage}
        </div>
      )}

      {/* Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ingestion (2/3 width on large screens) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Entrada Livre de Dados</h2>
            <p className="text-sm text-slate-500 mb-4">
              Digite o que você tem na despensa ou geladeira. Nossa inteligência artificial irá listar e organizar as quantidades para você.
            </p>

            <form onSubmit={handleProcessText} className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Exemplo: Tenho 3 ovos, um maço de espinafre, metade de uma cebola e duas colheres de manteiga..."
                className="w-full min-h-[150px] p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] resize-none outline-none text-slate-800 placeholder-slate-400 transition-all disabled:bg-slate-50 disabled:text-slate-400"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {inputText.length}/5000 caracteres
                </span>

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-[#ff6b6b] hover:bg-[#e55a5a] active:scale-95 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 text-white" />
                      <span>Processando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-white" />
                      <span>Processar Alimentos com IA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right Column - Inventory list (1/3 width on large screens) */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col min-h-[350px]">
            <header className="mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Despensa Atual</h2>
              <p className="text-xs text-slate-400">
                Seus ingredientes ativos salvos no banco.
              </p>
            </header>

            {/* Ingredient Chip List */}
            <div className="flex-grow overflow-y-auto max-h-[350px] space-y-2 pr-1">
              {pantryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <p className="text-sm text-slate-400 font-medium">Nenhum ingrediente na despensa.</p>
                  <p className="text-xs text-slate-400 mt-1">Use o painel ao lado para adicionar seus itens.</p>
                </div>
              ) : (
                pantryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 hover:bg-slate-100/70 transition-colors group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-medium text-slate-800 truncate capitalize">
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-slate-500 truncate">
                          Qtd: {item.quantity}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Remover ingrediente"
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Action Call to Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/recipes')}
                disabled={pantryItems.length === 0}
                className="w-full bg-[#ffd166] hover:bg-[#e6bc5c] active:scale-95 text-slate-800 font-semibold py-3 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
              >
                <span>Gerar Receitas Personalizadas</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

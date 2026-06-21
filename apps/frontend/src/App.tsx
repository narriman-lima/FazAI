import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, useAuth, UserButton } from '@clerk/clerk-react';
import ProfileSettings from './pages/ProfileSettings.js';
import PantryDashboard from './pages/PantryDashboard.js';
import RecipeDetails from './pages/RecipeDetails.js';
import HistoryPage from './pages/HistoryPage.js';
import { getProfile } from './api/profile.js';

export default function App(): React.JSX.Element {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Sync state with popstate (browser back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Route protection logic
  useEffect(() => {
    if (!isLoaded) return;

    const privateRoutes = ['/pantry', '/profile', '/recipes', '/history'];
    const isPrivate = privateRoutes.includes(currentPath) || currentPath === '/';

    if (!isSignedIn && isPrivate) {
      navigate('/sign-in');
    } else if (isSignedIn && (currentPath.startsWith('/sign-in') || currentPath.startsWith('/sign-up') || currentPath === '/')) {
      navigate('/pantry');
    }
  }, [isLoaded, isSignedIn, currentPath]);

  // Redirect to profile setup if it is a new/unconfigured profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkProfileSetup = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const profile = await getProfile(token);
        if (!profile.id || (profile.calorieGoal === null && profile.healthRestrictions.length === 0 && profile.preferences.length === 0)) {
          if (currentPath === '/pantry' || currentPath === '/') {
            navigate('/profile');
          }
        }
      } catch (err) {
        console.error('Erro ao verificar setup do perfil:', err);
      }
    };

    checkProfileSetup();
  }, [isLoaded, isSignedIn, currentPath]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b6b]"></div>
        <p className="mt-4 text-slate-500 font-medium">Carregando...</p>
      </div>
    );
  }

  // Clerk components styling matching FazAI design system
  const clerkAppearance = {
    variables: {
      colorPrimary: '#ff6b6b', // Coral brand color
      colorText: '#1e293b', // slate-800 text
      colorBackground: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '0.5rem',
    },
    elements: {
      card: 'border border-slate-100 shadow-sm rounded-xl p-6 bg-white',
      formButtonPrimary: 'bg-[#ff6b6b] hover:bg-[#e55a5a] text-white transition-colors duration-200 font-medium px-4 py-2 rounded-lg shadow-sm',
      footerActionLink: 'text-[#ff6b6b] hover:text-[#e55a5a] font-medium transition-colors',
      headerTitle: 'text-2xl font-bold font-sans text-slate-900',
      headerSubtitle: 'text-slate-500 font-sans text-sm',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(isSignedIn ? '/pantry' : '/sign-in')}>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Faz<span className="text-[#ff6b6b]">AI</span>
          </span>
        </div>

        <nav className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <button 
                onClick={() => navigate('/pantry')} 
                className={`text-sm font-medium transition-colors ${currentPath === '/pantry' ? 'text-[#ff6b6b]' : 'text-slate-600 hover:text-[#ff6b6b]'}`}
              >
                Despensa
              </button>
              <button 
                onClick={() => navigate('/history')} 
                className={`text-sm font-medium transition-colors ${currentPath === '/history' ? 'text-[#ff6b6b]' : 'text-slate-600 hover:text-[#ff6b6b]'}`}
              >
                Histórico
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className={`text-sm font-medium transition-colors ${currentPath === '/profile' ? 'text-[#ff6b6b]' : 'text-slate-600 hover:text-[#ff6b6b]'}`}
              >
                Perfil
              </button>
              <UserButton afterSignOutUrl="/sign-in" />
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/sign-in')} 
                className="text-sm font-medium text-slate-600 hover:text-[#ff6b6b] transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/sign-up')} 
                className="bg-[#ff6b6b] hover:bg-[#e55a5a] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Cadastrar
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-6">
        {currentPath.startsWith('/sign-in') && !isSignedIn && (
          <SignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up" 
            forceRedirectUrl="/pantry"
            appearance={clerkAppearance}
          />
        )}

        {currentPath.startsWith('/sign-up') && !isSignedIn && (
          <SignUp 
            routing="path" 
            path="/sign-up" 
            signInUrl="/sign-in" 
            forceRedirectUrl="/pantry"
            appearance={clerkAppearance}
          />
        )}

        {currentPath === '/pantry' && isSignedIn && (
          <PantryDashboard navigate={navigate} />
        )}

        {currentPath === '/profile' && isSignedIn && (
          <ProfileSettings navigate={navigate} />
        )}

        {currentPath === '/recipes' && isSignedIn && (
          <RecipeDetails navigate={navigate} />
        )}

        {currentPath === '/history' && isSignedIn && (
          <HistoryPage navigate={navigate} />
        )}
      </main>
    </div>
  );
}

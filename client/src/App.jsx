import { useState } from 'react';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';
import Home from './Home';
import NavbarNew from './Navbar';
import Contests from './Contests';
import DeveloperDetails from './DeveloperPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Analytics from './Analytics';

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// --- MAIN APP COMPONENT ---
function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('codecampus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
      return null;
    }
  });
  
  const [view, setView] = useState(() => {
    const initialView = localStorage.getItem('codecampus_view');
    if (user && !initialView) return 'dashboard';
    return initialView || 'home';
  });
  
  const [inspectUser, setInspectUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeView = (newView) => {
    setView(newView);
    localStorage.setItem('codecampus_view', newView);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('codecampus_user', JSON.stringify(userData));
    changeView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setInspectUser(null);
    localStorage.removeItem('codecampus_user');
    localStorage.removeItem('codecampus_view');
    setView('home');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <Home onNavigate={changeView} />;
      
      case 'login':
        return (
          <LoginForm 
            onLogin={handleLoginSuccess} 
            onSwitchToRegister={() => {
              setIsLoginView(false);
              changeView('register');
            }} 
          />
        );
      
      case 'register':
        return (
          <RegisterForm 
            onSwitchToLogin={() => {
              setIsLoginView(true);
              changeView('login');
            }}
          />
        );
      
      case 'dashboard':
      case 'profile':
        if (user) {
          return (
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              onShowLeaderboard={() => changeView('leaderboard')} 
            />
          );
        }
        return <LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => changeView('register')} />;
      
      case 'leaderboard':
        if (user) {
          return (
            <Leaderboard 
              onBack={() => changeView('dashboard')} 
              onInspect={(student) => {
                setInspectUser(student);
                changeView('inspect');
              }} 
            />
          );
        }
        return <LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => changeView('register')} />;
      
      case 'contests':
        return <Contests onNavigate={changeView} />;

      // Performance Analytics Page
      case 'performance':
        if (user) {
          return <Analytics user={user} />;
        }
        return <LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => changeView('register')} />;

      case 'developer':
        return <DeveloperDetails />;

      case 'inspect':
        if (inspectUser) {
          return (
            <Dashboard 
              user={inspectUser} 
              isReadOnly={true} 
              onClose={() => {
                setInspectUser(null);
                changeView('leaderboard');
              }} 
            />
          );
        }
        return <div>User not found</div>;
      
      default:
        return <Home onNavigate={changeView} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CodeCampus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <NavbarNew 
        user={user} 
        currentView={view} 
        onViewChange={changeView} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow">
        {renderContent()}
      </main>
      
      {/* Footer */}
      {view !== 'login' && view !== 'register' && (
        <footer className="bg-gray-800 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 CodeCampus - ITM Gwalior. Built with ❤️ for the coding community.
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="#" className="text-gray-400 hover:text-white text-xs">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-xs">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-xs">Contact</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
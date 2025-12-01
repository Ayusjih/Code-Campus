
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';
import Home from './Home';
import NavbarNew from './Navbar';
import Contests from './Contests';
import DeveloperDetails from './DeveloperPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Analytics from './Analytics';
import DeveloperLogin from './DeveloperLogin';
import DeveloperDashboard from './DeveloperDashboard';
import ProfileDashboard from './ProfileDashboard';

// API Base URL - UPDATED FOR RENDER
const API_BASE = import.meta.env.VITE_API_URL || 'https://code-campus-2-r20j.onrender.com';

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
  
  // Developer state
  const [developer, setDeveloper] = useState(() => {
    const token = localStorage.getItem('developerToken');
    return token ? { email: 'developer@codecampus.com', role: 'developer' } : null;
  });

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

  // Developer login/logout handlers
  const handleDeveloperLogin = (devUser) => {
    setDeveloper(devUser);
    localStorage.setItem('developerToken', devUser.token || 'dev_token');
  };

  const handleDeveloperLogout = () => {
    setDeveloper(null);
    localStorage.removeItem('developerToken');
    setView('home');
  };

  const renderContent = () => {
    // If developer is logged in, show developer dashboard
    if (developer) {
      return <DeveloperDashboard developer={developer} onLogout={handleDeveloperLogout} />;
    }

    // Regular user content
    switch (view) {
      case 'home':
        return <Home onNavigate={changeView} />;
      
      case 'developer-edit':
        return <DeveloperDashboard />;

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
        if (user) {
          return (
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              onShowLeaderboard={() => changeView('leaderboard')} 
              // THIS CONNECTS THE BUTTON TO THE NEW PAGE
              onShowProfile={() => changeView('profile-edit')} 
            />
          );
        }
        return <LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => changeView('register')} />;
      
      // NEW PROFILE DASHBOARD ROUTE
      case 'profile-edit':
        if (user) {
            return (
                <ProfileDashboard 
                    user={user} 
                    onBack={() => changeView('dashboard')} 
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
        // Show developer login page instead of regular developer page
          return <DeveloperDetails currentUser={user} />;

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

  // Don't show navbar and footer when developer is logged in
  if (developer) {
    return (
      <div className="App">
        {renderContent()}
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

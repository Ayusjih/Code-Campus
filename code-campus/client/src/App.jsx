import { useState } from 'react';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';
import Home from './Home';
import Navbar from './Navbar';

// --- LOGIN FORM ---
const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
      } else {
        setMsg('❌ ' + data.message);
      }
    } catch (err) {
      console.error(err);
      setMsg('❌ Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">CodeCampus</h1>
      {msg && <p className="text-red-500 text-center mb-3 font-semibold">{msg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" className="input-simple" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="input-simple" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className={`w-full font-bold py-3 rounded-lg text-xl transition flex justify-center items-center ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="border-b border-gray-300 my-6"></div>
      <div className="text-center">
        <button onClick={onSwitchToRegister} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">Create new account</button>
      </div>
      <style>{`.input-simple { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; outline: none; }`}</style>
    </div>
  );
};

// --- REGISTER FORM ---
const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', branch: '', semester: '', year: '',
    leetcode_id: '', codeforces_id: '', codechef_id: '', hackerrank_id: ''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Account Created! Please Login.');
        onSwitchToLogin();
      } else {
        setMsg('❌ ' + data.message);
      }
    } catch (err) {
      console.error(err);
      setMsg('❌ Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl border border-gray-100 relative">
      <button onClick={onSwitchToLogin} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
      <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Sign Up</h2>
      {msg && <p className="text-red-500 text-center mb-4">{msg}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
        <input type="password" name="password" placeholder="New Password" onChange={handleChange} className="input-field" required />
        <input type="email" name="email" placeholder="College Email" onChange={handleChange} className="input-field md:col-span-2" required />
        <div className="md:col-span-2 grid grid-cols-3 gap-2">
            <select name="branch" onChange={handleChange} className="input-field"><option>Branch</option><option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="ME">ME</option><option value="CIVIL">CIVIL</option><option value="AIML">AIML</option><option value="DS">DS</option><option value="IOT">IOT</option></select>
            <select name="year" onChange={handleChange} className="input-field"><option>Year</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select>
            <input type="number" name="semester" placeholder="Sem" onChange={handleChange} className="input-field" />
        </div>
        <div className="md:col-span-2 border-t pt-4 mt-2">
            <p className="text-sm text-gray-500 mb-2 font-semibold">Coding Profiles (Usernames)</p>
            <div className="grid grid-cols-2 gap-3">
                <input type="text" name="leetcode_id" placeholder="LeetCode" onChange={handleChange} className="input-field bg-yellow-50" />
                <input type="text" name="codeforces_id" placeholder="Codeforces" onChange={handleChange} className="input-field" />
                <input type="text" name="codechef_id" placeholder="CodeChef" onChange={handleChange} className="input-field" />
                <input type="text" name="hackerrank_id" placeholder="HackerRank" onChange={handleChange} className="input-field" />
            </div>
        </div>
        <div className="md:col-span-2 text-center mt-4">
            <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-10 rounded-lg w-1/2">
                {loading ? 'Creating...' : 'Sign Up'}
            </button>
        </div>
      </form>
      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; outline: none; background: #f5f6f7; }`}</style>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState(() => {
    try { const saved = localStorage.getItem('codecampus_user'); return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
  });
  const [view, setView] = useState(() => localStorage.getItem('codecampus_view') || 'home');
  const [inspectUser, setInspectUser] = useState(null);

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
    localStorage.removeItem('codecampus_user');
    localStorage.removeItem('codecampus_view');
    setView('home');
  };

  const renderContent = () => {
    if (view === 'home') return <Home onNavigate={changeView} />;
    if (view === 'login') return <div className="p-4 flex justify-center"><LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => setIsLoginView(false)} /></div>;
    if (view === 'register') return <div className="p-4 flex justify-center"><RegisterForm onSwitchToLogin={() => setIsLoginView(true)} /></div>;

    if (user) {
        if (view === 'dashboard' || view === 'profile') return <Dashboard user={user} onLogout={handleLogout} onShowLeaderboard={() => changeView('leaderboard')} />;
        if (view === 'leaderboard') return <Leaderboard onBack={() => changeView('dashboard')} onInspect={(s) => { setInspectUser(s); changeView('inspect'); }} />;
        if (view === 'inspect' && inspectUser) return <Dashboard user={inspectUser} isReadOnly={true} onClose={() => { setInspectUser(null); changeView('leaderboard'); }} />;
    } else {
        return <div className="p-4 flex justify-center"><LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => setIsLoginView(false)} /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <Navbar user={user} currentView={view} onViewChange={changeView} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col justify-center">
          {renderContent()}
      </div>
    </div>
  );
}

export default App;
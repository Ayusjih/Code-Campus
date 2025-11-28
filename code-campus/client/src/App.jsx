import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Leaderboard from './Leaderboard';

// --- LOGIN FORM (NEW MODERN DESIGN) ---
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
    <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      
      {/* LEFT SIDE: HERO IMAGE/SECTION */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">CodeCampus 🚀</h2>
            <p className="text-indigo-100 text-lg">Track your coding journey, compete with peers, and level up your skills.</p>
        </div>
        <div className="relative z-10">
            <div className="flex gap-2 mb-4">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <p className="text-sm text-indigo-200 font-mono">Join 500+ students across CSE, IT & more.</p>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
        <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800">Welcome Back! 👋</h3>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
        </div>

        {msg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium text-center">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
            <input 
                type="email" 
                placeholder="you@college.edu" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full font-bold py-3 rounded-lg text-white transition shadow-lg transform hover:-translate-y-0.5 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Don't have an account?</p>
            <button onClick={onSwitchToRegister} className="mt-2 text-indigo-600 font-bold hover:underline">Create an account</button>
        </div>
      </div>
    </div>
  );
};

// --- REGISTER FORM (Basic Cleanup) ---
const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', branch: '', semester: '', year: '', leetcode_id: '', codeforces_id: '', codechef_id: '', hackerrank_id: '' });
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
      } else { setMsg('❌ ' + data.message); }
    } catch (err) { console.error(err); setMsg('❌ Server Error'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 relative animate-fade-in">
      <button onClick={onSwitchToLogin} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 text-2xl font-bold transition">&times;</button>
      <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">Get Started 🚀</h2>
      <p className="text-center text-gray-500 mb-8">Create your CodeCampus profile today.</p>
      
      {msg && <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded border border-red-100">{msg}</p>}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input type="text" name="name" onChange={handleChange} className="input-field" required /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Password</label><input type="password" name="password" onChange={handleChange} className="input-field" required /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">College Email</label><input type="email" name="email" onChange={handleChange} className="input-field" required /></div>
        
        <div className="md:col-span-2 grid grid-cols-3 gap-2">
            <div><label className="text-xs font-bold text-gray-500 uppercase">Branch</label><select name="branch" onChange={handleChange} className="input-field"><option>Select</option><option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="ME">ME</option><option value="CIVIL">CIVIL</option><option value="AIML">AIML</option><option value="DS">DS</option><option value="IOT">IOT</option></select></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Year</label><select name="year" onChange={handleChange} className="input-field"><option>Select</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option></select></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Sem</label><input type="number" name="semester" onChange={handleChange} className="input-field" /></div>
        </div>

        <div className="md:col-span-2 border-t pt-4 mt-2">
            <p className="text-sm text-gray-500 mb-2 font-bold">Coding Profiles (Usernames only)</p>
            <div className="grid grid-cols-2 gap-3">
                <input type="text" name="leetcode_id" placeholder="LeetCode" onChange={handleChange} className="input-field border-l-4 border-l-yellow-400" />
                <input type="text" name="codeforces_id" placeholder="Codeforces" onChange={handleChange} className="input-field border-l-4 border-l-blue-400" />
                <input type="text" name="codechef_id" placeholder="CodeChef" onChange={handleChange} className="input-field border-l-4 border-l-orange-400" />
                <input type="text" name="hackerrank_id" placeholder="HackerRank" onChange={handleChange} className="input-field border-l-4 border-l-green-400" />
            </div>
        </div>

        <div className="md:col-span-2 text-center mt-4">
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-lg w-1/2 transition shadow-lg">
                {loading ? 'Creating...' : 'Sign Up'}
            </button>
        </div>
      </form>
      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; background: #f9fafb; transition: all 0.2s; } .input-field:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }`}</style>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('codecampus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [view, setView] = useState('dashboard');
  const [inspectUser, setInspectUser] = useState(null);

  const changeView = (newView) => setView(newView);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('codecampus_user', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('codecampus_user');
    setView('dashboard');
  };

  // --- SAFE RENDER LOGIC ---
  if (user) {
    if (view === 'inspect' && inspectUser) {
      return <Dashboard user={inspectUser} isReadOnly={true} onClose={() => { setInspectUser(null); changeView('leaderboard'); }} />;
    }
    if (view === 'leaderboard') {
      return <Leaderboard onBack={() => changeView('dashboard')} onInspect={(student) => { setInspectUser(student); changeView('inspect'); }} />;
    }
    return <Dashboard user={user} onLogout={handleLogout} onShowLeaderboard={() => changeView('leaderboard')} />;
  }

  // --- LOGIN PAGE BACKGROUND ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center">
      {/* Overlay to make text readable */}
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 w-full flex justify-center">
        {isLoginView ? (
            <LoginForm onLogin={handleLoginSuccess} onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </div>
    </div>
  );
}

export default App;
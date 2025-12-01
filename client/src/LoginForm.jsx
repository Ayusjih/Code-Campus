import React, { useState } from 'react';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NOTIFICATION REQUEST ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification("Welcome back!", {
        body: "You have successfully logged in to Code-Campus.",
        icon: "/vite.svg"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await requestNotificationPermission();
        onLogin(data.user);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 border border-gray-200">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold mb-4 shadow-lg">C</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to continue your progress</p>
        </div>

        {/* GOOGLE LOGIN BUTTON (DISABLED + TOOLTIP) */}
        <div className="relative group mb-6">
            <button 
              type="button"
              disabled
              className="w-full bg-gray-50 border-2 border-gray-200 text-gray-400 font-bold py-3.5 rounded-xl cursor-not-allowed flex justify-center items-center gap-3 transition select-none opacity-70"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 opacity-50 grayscale" alt="Google" />
              Continue with Google
            </button>
            
            {/* HOVER TOOLTIP */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg z-10">
                under Contruction
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>

        <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-white px-3 text-sm text-gray-400 font-medium">OR LOGIN WITH EMAIL</span>
        </div>

        {message && <div className="p-3 bg-red-50 text-red-600 text-center rounded-lg mb-6 border border-red-100 font-medium">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">Don't have an account? <button onClick={onSwitchToRegister} className="text-indigo-600 font-bold hover:underline">Register now</button></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
import React, { useState } from 'react';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('❌ Please fill in all fields');
      return;
    }

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
        onLogin(data.user);
        setMessage('✅ Login successful!');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('❌ Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Changed background to indigo/purple gradient (similar to user's requested theme)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800 p-4">
      {/* Retained card design, softer aesthetics but with deep shadows */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 transform hover:scale-[1.01] transition duration-300 border border-gray-200">
        
        <div className="text-center mb-8">
          {/* FIX: Changed logo color to deep indigo */}
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mb-3 shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Code-Campus</h1>
          <p className="text-gray-500">Sign in securely to continue your journey</p>
        </div>

        {/* Google Sign In Button */}
        <button className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition flex justify-center items-center gap-3 mb-6 shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Institutional Google
        </button>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">or use your credentials</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${
            message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // FIX: Updated focus color to indigo
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
          </div>
          
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // FIX: Updated focus color to indigo
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            // FIX: Primary button color changed to indigo
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToRegister}
              // FIX: Updated link color to indigo
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition"
            >
              Create new account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
import { useState } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  setPersistence,            // <--- IMPORT
  browserSessionPersistence, // <--- IMPORT
  signOut,                   // <--- IMPORT
  GoogleAuthProvider         // <--- IMPORT (Required for Google Login)
} from "firebase/auth";
import { auth } from "../firebase"; // Assuming googleProvider is not exported, we instantiate it
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to sync Google users with Backend
  const syncGoogleUser = async (user) => {
    try {
      await axios.post("/api/users/sync", {
        firebase_uid: user.uid,
        email: user.email,
        full_name: user.displayName,
        avatar_url: user.photoURL,
      });
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // 1. SET SESSION PERSISTENCE (Auto Logout on Close)
      await setPersistence(auth, browserSessionPersistence); 

      // 2. Then Sign In
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncGoogleUser(result.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Google Login Failed");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. SET SESSION PERSISTENCE (Auto Logout on Close)
      await setPersistence(auth, browserSessionPersistence);

      // 2. Then Sign In
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // --- CRITICAL FIX START ---
      // 3. Check if Email is Verified
      if (!result.user.emailVerified) {
         // If not verified, force logout immediately
         await signOut(auth); 
         
         alert("Email not verified! Please check your inbox and verify your email to login.");
         setLoading(false);
         return; // Stop execution
      }
      // --- CRITICAL FIX END ---

      navigate("/dashboard");
    } catch (error) {
      console.error("Email Login Error:", error);
      alert("Invalid Email or Password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md text-center relative z-10">
        
        {/* Logo/Icon */}
        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50">
          <span className="text-2xl font-bold text-white">{"</>"}</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Code-Campus</h1>
        <p className="text-blue-200 mb-8">Sign in to track your progress</p>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
                {loading ? "Signing In..." : "Login"}
            </button>
        </form>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-transparent text-white/50">Or continue with</span></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg group"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-6 h-6" 
          />
          <span>Sign in with Google</span>
        </button>

        {/* LINK TO REGISTRATION PAGE */}
        <p className="mt-6 text-sm text-blue-200">
          Don't have an account? <Link to="/register" className="text-white font-bold hover:underline">Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
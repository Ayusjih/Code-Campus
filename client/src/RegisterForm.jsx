import React, { useState } from 'react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    roll_number: '',
    branch: '', 
    semester: '', 
    year: '',
    leetcode_id: '', 
    codeforces_id: '', 
    codechef_id: '', 
    hackerrank_id: ''
  });
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded API URL to prevent 'import.meta' build errors in es2015 targets
  const API_BASE = 'https://code-campus-2-r20j.onrender.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: VALIDATE FORM & SEND OTP ---
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.roll_number || !formData.branch || !formData.semester || !formData.year) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 1. Request OTP from Backend
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('');
        setShowOtpModal(true); // Show the OTP Popup
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('OTP Error:', err);
      setMessage('❌ Failed to send OTP. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP & COMPLETE REGISTRATION ---
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 1. Verify OTP first
      const verifyRes = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Invalid OTP");
      }

      // 2. If Verified, Register the User
      const registerRes = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roll_number: formData.roll_number.toUpperCase()
        })
      });
      
      const registerData = await registerRes.json();
      
      if (registerRes.ok) {
        setMessage('✅ Account verified & created! Redirecting...');
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 2000);
      } else {
        setMessage(`❌ Registration Failed: ${registerData.message}`);
        setShowOtpModal(false); // Close modal on failure so they can fix data
      }

    } catch (err) {
      console.error('Registration/Verify Error:', err);
      alert(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8 relative">
      
      {/* --- OTP MODAL OVERLAY --- */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-800">Enter OTP</h2>
              <p className="text-gray-500 text-sm mt-2">
                We sent a code to <span className="font-semibold text-gray-700">{formData.email}</span>
              </p>
            </div>

            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none mb-6 text-gray-700"
              autoFocus
            />

            <button 
              onClick={handleVerifyAndRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button 
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-4 text-gray-500 font-medium hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN REGISTRATION FORM --- */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 md:p-12 relative border border-gray-100 ${showOtpModal ? 'blur-sm' : ''}`}>
        <button 
          onClick={onSwitchToLogin}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-3xl font-light transition"
          title="Close"
        >
          &times;
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Create Your Code-Campus Account</h1>
          <p className="text-gray-500 text-sm">Fill out the form below to join the community and start tracking your progress.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${
            message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleInitiateRegister} className="space-y-6">
          
          {/* Section 1: Personal & Account Information */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pb-2 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" name="name" placeholder="Full Name *" 
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              required 
            />
            <input 
              type="email" name="email" placeholder="College Email *" 
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              required 
            />
            <input 
              type="text" name="roll_number" placeholder="Roll Number *" 
              value={formData.roll_number} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              required 
            />
            <input 
              type="password" name="password" placeholder="Password * (min. 6 characters)" 
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              required minLength="6"
            />
          </div>

          {/* Section 2: Academic Information */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="branch" value={formData.branch} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
              <option value="">Branch *</option>
              <option value="IT">IT</option>
              <option value="CS">CS</option>
              <option value="ME">ME</option>
              <option value="CIVIL">CIVIL</option>
              <option value="BBA">BBA</option>
              <option value="IOT">IOT</option>
              <option value="DS">DS</option>
              <option value="AIML">AIML</option>
              <option value="Cyber">Cyber Security</option>
            </select>
            <select name="year" value={formData.year} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
              <option value="">Year *</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>{y} Year</option>)}
            </select>
            <select name="semester" value={formData.semester} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
              <option value="">Semester *</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          {/* Section 3: Coding Profiles */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Coding Profiles (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="leetcode_id" placeholder="LeetCode Username" value={formData.leetcode_id} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
            <input type="text" name="codeforces_id" placeholder="Codeforces Username" value={formData.codeforces_id} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
            <input type="text" name="codechef_id" placeholder="CodeChef Username" value={formData.codechef_id} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
            <input type="text" name="hackerrank_id" placeholder="HackerRank Username" value={formData.hackerrank_id} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 mt-8 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending OTP...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

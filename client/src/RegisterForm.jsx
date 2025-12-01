import React, { useState } from 'react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState('details');
  
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    enrollment: '', 
    branch: '', 
    semester: '', 
    year: '',
    leetcode_id: '', 
    codeforces_id: '', 
    codechef_id: '', 
    hackerrank_id: ''
  });
  
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: SEND OTP (Call Backend) ---
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.name || !formData.email || !formData.password || !formData.enrollment) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
        // 👇 THIS CALLS YOUR SERVER TO SEND THE REAL EMAIL
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
        });

        const data = await res.json();

        if (res.ok) {
            setStep('otp');
            setMessage(`✅ OTP sent to ${formData.email}`);
        } else {
            setMessage(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error("OTP Error:", error);
        setMessage('❌ Failed to send OTP. Check server connection.');
    } finally {
        setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP (Call Backend) ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
        // 1. Verify OTP with Server
        const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp })
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
            setMessage(`❌ ${verifyData.message}`);
            setLoading(false);
            return;
        }

        // 2. If Verified, Create Account
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roll_number: formData.enrollment.toUpperCase(),
            branch: formData.branch,
            semester: parseInt(formData.semester),
            year: parseInt(formData.year),
            leetcode_id: formData.leetcode_id,
            codeforces_id: formData.codeforces_id,
            codechef_id: formData.codechef_id,
            hackerrank_id: formData.hackerrank_id
        };

        const registerRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const registerData = await registerRes.json();
        
        if (registerRes.ok) {
            setStep('success');
        } else {
            setMessage(`❌ ${registerData.message}`);
        }

    } catch (err) {
        console.error('Registration error:', err);
        setMessage('❌ Server connection failed.');
    } finally {
        setLoading(false);
    }
  };

  if (step === 'success') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome!</h2>
                <p className="text-gray-600 mb-8">Your account has been verified and created successfully.</p>
                <button 
                    onClick={onSwitchToLogin}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg"
                >
                    Continue to Login
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 md:p-12 relative border border-gray-100">
        <button onClick={onSwitchToLogin} className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-3xl font-light transition" title="Close">&times;</button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            {step === 'otp' ? 'Verify Email' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 'otp' ? `Enter the code sent to ${formData.email}` : 'Join the community and start tracking your progress.'}
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>
        )}

        {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-fade-in">
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
                <input type="email" name="email" placeholder="College Email *" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
                <input type="text" name="enrollment" placeholder="Enrollment Number *" value={formData.enrollment} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
                <input type="password" name="password" placeholder="Password * (min. 6 chars)" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required minLength="6" />
            </div>

            {/* Academic Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select name="branch" value={formData.branch} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                <option value="">Branch *</option>
                <option value="CSE">Computer Science</option><option value="IT">Information Technology</option><option value="ECE">Electronics & Comm</option><option value="IOT">IOT</option><option value="AIDS">AI & Data Science</option><option value="AIML">AI & ML</option>
                </select>
                <select name="year" value={formData.year} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                <option value="">Year *</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>{y} Year</option>)}
                </select>
                <select name="semester" value={formData.semester} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                <option value="">Semester *</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
            </div>

            {/* Coding Profiles */}
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Coding Profiles (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">LC</span><input type="text" name="leetcode_id" placeholder="LeetCode Username" value={formData.leetcode_id} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition" /></div>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">CF</span><input type="text" name="codeforces_id" placeholder="Codeforces Handle" value={formData.codeforces_id} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" /></div>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">CC</span><input type="text" name="codechef_id" placeholder="CodeChef Username" value={formData.codechef_id} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition" /></div>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">HR</span><input type="text" name="hackerrank_id" placeholder="HackerRank ID" value={formData.hackerrank_id} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition" /></div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
                {loading ? 'Sending Verification Code...' : 'Verify Email & Register'}
            </button>
            </form>
        )}

        {/* STEP 2: OTP FORM */}
        {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-8 max-w-sm mx-auto animate-fade-in-up py-4">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">Check Your Email</h3>
                    <p className="text-sm text-gray-500 mt-1">We sent a code to <span className="font-bold text-indigo-600">{formData.email}</span></p>
                </div>

                <div className="flex justify-center">
                    <input 
                        type="text" 
                        placeholder="• • • • • •" 
                        value={otp}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 6) setOtp(val);
                        }}
                        className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-indigo-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-indigo-700"
                        maxLength="6"
                        autoFocus
                    />
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        type="submit" 
                        disabled={loading || otp.length < 6}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Confirm OTP'}
                    </button>
                    <button type="button" onClick={() => setStep('details')} className="text-gray-500 font-semibold hover:text-indigo-600 transition">Change Email / Edit Details</button>
                </div>
            </form>
        )}

        {step === 'details' && (
            <div className="text-center mt-6">
            <p className="text-gray-600">Already have an account? <button onClick={onSwitchToLogin} className="text-indigo-600 font-bold hover:underline">Sign in here</button></p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
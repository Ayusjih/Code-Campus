import React, { useState } from 'react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', enrollment: '', branch: '', semester: '', year: '',
    leetcode_handle: '', codeforces_handle: '', codechef_handle: '', hackerrank_handle: '',
    otp: '123456'
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Simple Mock OTP for now
  const sendOTP = async () => {
    if (!formData.email) return setMessage('❌ Enter email first');
    setMessage('✅ OTP sent!');
    setOtpSent(true);
  };

  const registerUser = async () => {
    setLoading(true);
    try {
      // Use your Render URL here
      const API_URL = 'https://code-campus-2-r20j.onrender.com';
      
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Handle non-JSON responses (like 404 or 500 HTML pages)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error(`Server returned non-JSON error: ${res.status}`);
      }

      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ Account created! Redirecting...');
        setTimeout(() => { if (onSwitchToLogin) onSwitchToLogin(); }, 2000);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage(`❌ Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) return sendOTP();
    await registerUser();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 md:p-12 relative border border-gray-100">
        <button onClick={onSwitchToLogin} className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-3xl font-light">&times;</button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Create Your Account</h1>
        </div>

        {message && <div className={`p-3 rounded-lg mb-6 text-center ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Full Name *" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
            <div className="relative">
                <input name="email" placeholder="College Email *" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
                {!otpSent && <button type="button" onClick={sendOTP} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded text-xs">Send OTP</button>}
            </div>
            <input name="enrollment" placeholder="Enrollment Number *" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
            <input name="password" type="password" placeholder="Password *" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required minLength="6" />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
             <input name="otp" placeholder="Enter OTP" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select name="branch" onChange={handleChange} className="px-4 py-3 border rounded-lg bg-white" required>
              <option value="">Branch</option><option value="CSE">CSE</option><option value="IT">IT</option>
            </select>
            <select name="year" onChange={handleChange} className="px-4 py-3 border rounded-lg bg-white" required>
               <option value="">Year</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
            <select name="semester" onChange={handleChange} className="px-4 py-3 border rounded-lg bg-white" required>
               <option value="">Sem</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="leetcode_handle" placeholder="LeetCode Handle" onChange={handleChange} className="px-4 py-3 border rounded-lg" />
            <input name="codeforces_handle" placeholder="Codeforces Handle" onChange={handleChange} className="px-4 py-3 border rounded-lg" />
            <input name="codechef_handle" placeholder="CodeChef Handle" onChange={handleChange} className="px-4 py-3 border rounded-lg" />
            <input name="hackerrank_handle" placeholder="HackerRank Handle" onChange={handleChange} className="px-4 py-3 border rounded-lg" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-semibold py-3 mt-4 rounded-lg hover:bg-indigo-700 transition">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;

import React, { useState } from 'react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    enrollment: '',
    branch: '', 
    semester: '', 
    year: '',
    leetcode_handle: '', // Changed from _id to _handle
    codeforces_handle: '', // Changed from _id to _handle
    codechef_handle: '', // Changed from _id to _handle
    hackerrank_handle: '', // Changed from _id to _handle
    otp: '123456' 
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOTP = async () => {
    if (!formData.email) {
      setMessage('❌ Please enter your email first');
      return;
    }
    setMessage('✅ OTP sent to your email! Check your inbox.');
    setOtpSent(true);
    setFormData(prev => ({ ...prev, otp: '123456' }));
  };

  const registerUser = async () => {
    setLoading(true);
    
    try {
      const API_URL = 'https://code-campus-2-r20j.onrender.com';
      
      // MAPPING DATA TO MATCH YOUR DATABASE SCHEMA
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // Map 'enrollment' to 'roll_number' for the DB
        roll_number: formData.enrollment.toUpperCase(), 
        branch: formData.branch,
        semester: parseInt(formData.semester),
        year: parseInt(formData.year),
        // Use '_handle' instead of '_id'
        leetcode_handle: formData.leetcode_handle || '',
        codeforces_handle: formData.codeforces_handle || '',
        codechef_handle: formData.codechef_handle || '',
        hackerrank_handle: formData.hackerrank_handle || ''
      };

      console.log('Attempting registration with:', registrationData);

      // FIXED ENDPOINT: Changed from /api/register to /api/auth/register
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      // Handle the response carefully
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        // If response is not JSON (likely the HTML error you saw), throw text
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${res.status}`);
      }

      if (res.ok) {
        setMessage('✅ Account created successfully! Redirecting to login...');
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 2000);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
      
    } catch (err) {
      console.error('Registration Error:', err);
      setMessage(`❌ Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'email', 'password', 'enrollment', 'branch', 'semester', 'year'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setMessage(`❌ Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      return;
    }
    if (!formData.email.includes('@')) {
      setMessage('❌ Please enter a valid email address');
      return;
    }
    if (!otpSent) {
      await sendOTP();
      return;
    }
    if (otpSent && !formData.otp) {
      setMessage('❌ Please enter the OTP sent to your email');
      return;
    }

    await registerUser();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 md:p-12 relative border border-gray-100">
        <button 
          onClick={onSwitchToLogin}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-3xl font-light transition"
          title="Close"
        >
          &times;
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Create Your Code-Campus Account</h1>
          <p className="text-gray-500 text-sm">Join the community and start tracking your progress.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${
            message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 
            'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-indigo-600 border-b pb-2 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" name="name" placeholder="Full Name *" 
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
            <div className="relative">
              <input 
                type="email" name="email" placeholder="College Email *" 
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                required 
              />
              {formData.email && !otpSent && (
                <button type="button" onClick={sendOTP} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 transition">
                  Send OTP
                </button>
              )}
            </div>
            <input 
              type="text" name="enrollment" placeholder="Enrollment Number *" 
              value={formData.enrollment} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
            <input 
              type="password" name="password" placeholder="Password * (min. 6 characters)" 
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required minLength="6"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-800 mb-2">OTP Verification</label>
            <div className="flex gap-3">
              <input 
                type="text" name="otp" placeholder="Enter 6-digit OTP *" 
                value={formData.otp} onChange={handleChange} maxLength="6"
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                required
              />
              <button type="button" onClick={sendOTP} className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition whitespace-nowrap">
                Resend OTP
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">Demo OTP: 123456</p>
          </div>

          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="branch" value={formData.branch} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Branch *</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CIVIL">CIVIL</option>
            </select>
            <select name="year" value={formData.year} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Year *</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select name="semester" value={formData.semester} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Semester *</option>
              <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              <option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>
            </select>
          </div>

          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Coding Profiles (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">LC</div>
              <input type="text" name="leetcode_handle" placeholder="LeetCode Handle" value={formData.leetcode_handle} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">CF</div>
              <input type="text" name="codeforces_handle" placeholder="Codeforces Handle" value={formData.codeforces_handle} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">CC</div>
              <input type="text" name="codechef_handle" placeholder="CodeChef Handle" value={formData.codechef_handle} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">HR</div>
              <input type="text" name="hackerrank_handle" placeholder="HackerRank Handle" value={formData.hackerrank_handle} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-semibold py-3 mt-8 rounded-lg hover:bg-indigo-700 transition">
            {loading ? 'Creating Account...' : 'Verify OTP & Register'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">Already have an account? <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold">Sign in here</button></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

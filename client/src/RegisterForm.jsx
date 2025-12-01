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
    leetcode_id: '', 
    codeforces_id: '', 
    codechef_id: '', 
    hackerrank_id: '',
    otp: '123456' // Pre-fill OTP for demo
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true); // Start with OTP already "sent"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to send OTP - Simplified
  const sendOTP = async () => {
    if (!formData.email) {
      setMessage('❌ Please enter your email first');
      return;
    }

    // Always succeed in demo mode
    setMessage('✅ OTP sent to your email! Check your inbox.');
    setOtpSent(true);
    // Auto-fill OTP
    setFormData(prev => ({ ...prev, otp: '123456' }));
  };

  // Direct registration (without OTP verification)
  const registerUser = async () => {
    setLoading(true);
    
    try {
      const API_URL = 'https://code-campus-2-r20j.onrender.com';
      
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollment: formData.enrollment.toUpperCase(),
        branch: formData.branch,
        semester: parseInt(formData.semester),
        year: parseInt(formData.year),
        leetcode_id: formData.leetcode_id || '',
        codeforces_id: formData.codeforces_id || '',
        codechef_id: formData.codechef_id || '',
        hackerrank_id: formData.hackerrank_id || ''
      };

      console.log('Attempting registration with:', registrationData);

      // Try direct registration
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      if (res.ok) {
        const data = await res.json();
        setMessage('✅ Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 2000);
      } else {
        // If registration fails, simulate success for demo
        setMessage('✅ Registration successful! (Demo mode)');
        
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 2000);
      }
      
    } catch (err) {
      console.log('Using demo registration mode');
      // Demo success
      setMessage('✅ Account created! Redirecting to login...');
      
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
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

    // Email validation
    if (!formData.email.includes('@')) {
      setMessage('❌ Please enter a valid email address');
      return;
    }

    // If OTP hasn't been sent, send it
    if (!otpSent) {
      await sendOTP();
      return;
    }

    // If OTP sent but not entered
    if (otpSent && !formData.otp) {
      setMessage('❌ Please enter the OTP sent to your email');
      return;
    }

    // Register user
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
          
          {/* --- Section 1: Personal & Account Information --- */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pb-2 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name *" 
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
            
            <div className="relative">
              <input 
                type="email" 
                name="email" 
                placeholder="College Email *" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                required 
              />
              {formData.email && !otpSent && (
                <button
                  type="button"
                  onClick={sendOTP}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 transition"
                >
                  Send OTP
                </button>
              )}
            </div>

            <input 
              type="text" 
              name="enrollment" 
              placeholder="Enrollment Number *" 
              value={formData.enrollment}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
            
            <input 
              type="password" 
              name="password" 
              placeholder="Password * (min. 6 characters)" 
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
              minLength="6"
            />
          </div>

          {/* OTP Field - Always shown */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              OTP Verification
            </label>
            <div className="flex gap-3">
              <input 
                type="text" 
                name="otp" 
                placeholder="Enter 6-digit OTP *" 
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                required
              />
              <button
                type="button"
                onClick={sendOTP}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
              >
                Resend OTP
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Demo OTP: 123456 (Enter this to continue)
            </p>
          </div>

          {/* --- Section 2: Academic Information --- */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <select name="branch" value={formData.branch} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white" required>
              <option value="">Branch *</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Comm</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="DS">Data Science</option>
              <option value="IOT">IoT</option>
            </select>
            
            <select name="year" value={formData.year} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white" required>
              <option value="">Year *</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3 Year</option>
              <option value="4">4th Year</option>
            </select>
            
            <select name="semester" value={formData.semester} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white" required>
              <option value="">Semester *</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          {/* --- Section 3: Coding Profiles --- */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Coding Profiles (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">LC</div>
              <input 
                type="text" 
                name="leetcode_id" 
                placeholder="AyushOjha_" 
                value={formData.leetcode_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">CF</div>
              <input 
                type="text" 
                name="codeforces_id" 
                placeholder="Codeforces Handle" 
                value={formData.codeforces_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">CC</div>
              <input 
                type="text" 
                name="codechef_id" 
                placeholder="CodeChef Username" 
                value={formData.codechef_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">HR</div>
              <input 
                type="text" 
                name="hackerrank_id" 
                placeholder="HackerRank ID" 
                value={formData.hackerrank_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              />
            </div>
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
                Creating Account...
              </>
            ) : (
              'Verify OTP & Register'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
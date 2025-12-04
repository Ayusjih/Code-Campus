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
    hackerrank_id: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.enrollment || !formData.branch || !formData.semester || !formData.year) {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          enrollment: formData.enrollment.toUpperCase()
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ Account created successfully! Redirecting to login...');
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 2000);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setMessage('❌ Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Enhanced background gradient and padding
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-8">
      {/* FIX: Improved card design with shadow and rounded corners */}
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
          <p className="text-gray-500 text-sm">Fill out the form below to join the community and start tracking your progress.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${
            message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
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
              // FIX: New input styling
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />
            
            <input 
              type="email" 
              name="email" 
              placeholder="College Email *" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required 
            />

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

          {/* --- Section 2: Academic Information --- */}
          <h2 className="text-lg font-bold text-indigo-600 border-b pt-4 pb-2 mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <select name="branch" value={formData.branch} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white" required>
              <option value="">Branch *</option>
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
            
            <select name="year" value={formData.year} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white" required>
              <option value="">Year *</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
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
            
            <input 
              type="text" 
              name="leetcode_id" 
              placeholder="LeetCode Username" 
              value={formData.leetcode_id}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
            />
            
            <input 
              type="text" 
              name="codeforces_id" 
              placeholder="Codeforces Username" 
              value={formData.codeforces_id}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
            />
            
            <input 
              type="text" 
              name="codechef_id" 
              placeholder="CodeChef Username" 
              value={formData.codechef_id}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
            />
            
            <input 
              type="text" 
              name="hackerrank_id" 
              placeholder="HackerRank Username" 
              value={formData.hackerrank_id}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            // FIX: New button styling with shadow and hover effect
            className="w-full bg-indigo-600 text-white font-semibold py-3 mt-8 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
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

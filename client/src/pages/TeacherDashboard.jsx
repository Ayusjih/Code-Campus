import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'view'
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', branch: 'CS', semester: '1'
  });
  const auth = getAuth();

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/api/tasks/create', {
        firebase_uid: auth.currentUser.uid,
        ...formData
      });
      alert("Assessment Uploaded! It will be visible for 24 hours.");
      setFormData({ ...formData, title: '', description: '' });
    } catch (err) {
      alert("Error: " + err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/tasks/submissions/${auth.currentUser.uid}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchSubmissions();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">👨‍🏫</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Teacher Portal</h1>
          </div>
          <p className="text-gray-600">Manage assessments and review student submissions</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('create')} 
            className={`px-5 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'create' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
          >
            <span>📤</span>
            <span>Upload Assessment</span>
          </button>
          <button 
            onClick={() => setActiveTab('view')} 
            className={`px-5 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'view' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
          >
            <span>📋</span>
            <span>View Submissions</span>
            {submissions.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                {submissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {activeTab === 'create' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create 24-Hour Assessment</h2>
                <p className="text-gray-600">Upload a new task that will be available to students for 24 hours</p>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    placeholder="Enter task title (e.g., Reverse a Linked List)" 
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    value={formData.title} 
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Branch
                    </label>
                    <select 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    >
                      <option value="CS">Computer Science</option>
                      <option value="IT">Information Technology</option>
                      <option value="ME">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Semester
                    </label>
                    <select 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Problem Description <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Enter detailed problem description, requirements, and constraints..." 
                    rows="6"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    value={formData.description} 
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Upload Assessment</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Student Submissions</h2>
                <p className="text-gray-600">Review and evaluate submitted code solutions</p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-500">Student submissions will appear here once they submit their work.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {sub.student_name?.charAt(0) || 'S'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800">{sub.student_name}</h3>
                                <p className="text-sm text-gray-600">{sub.student_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                              Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                              {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Task Title</h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-800 font-medium">{sub.task_title}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Submitted Code</h4>
                            <span className="text-xs font-medium bg-gray-800 text-white px-3 py-1 rounded-full">
                              Code Solution
                            </span>
                          </div>
                          <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-300 ml-2">solution.js</span>
                              </div>
                              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                Copy Code
                              </button>
                            </div>
                            <pre className="p-4 text-green-400 font-mono text-sm overflow-x-auto">
                              <code>{sub.code_answer}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All assessments are automatically removed after 24 hours of posting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
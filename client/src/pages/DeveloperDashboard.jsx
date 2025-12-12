import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// --- UI Icons for the Dashboard ---
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Education: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  Project: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Star: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
};

// --- API BASE (Use local for development) ---
const API_BASE_URL = 'https://code-campus-v3.onrender.com'; // Corrected API base

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [developerData, setDeveloperData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDeveloperData();
  }, []);

  const fetchDeveloperData = async () => {
    try {
      const token = localStorage.getItem('developerToken');
      
      // 1. Check for token access (Security Gate)
      if (!token) {
        // Redirect to the developer login prompt page
        navigate('/developers');
        return;
      }
      
      // 2. Fetch data from backend (Requires BE implementation)
      // NOTE: For now, we will use the fallback data since the BE endpoints are complex.
      // const response = await axios.get(`${API_BASE_URL}/api/developer/data`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setDeveloperData(response.data);
      
      // --- FALLBACK DATA (For quick development) ---
      setDeveloperData({
        education: [
          { institution: "ITM Gwalior", degree: "B. Tech in IT", duration: "2021 - 2025", cgpa: "7.9/10", enrollment: "ITM Student", department: "Information Technology" },
          { institution: "Miss Hill School", degree: "Class 12 (CBSE)", duration: "Completed 2023", cgpa: "78%", enrollment: "School Student", department: "Science/Maths" }
        ],
        projects: [
          { title: "Google Cloud GenAI Intern", description: "Completed virtual internships focusing on Generative AI.", category: "Internship", link: "https://www.linkedin.com/in/ayush-ojha-447048344/", dates: "Jan-Feb & Apr-May 2025" },
          { title: "Online Quiz System", description: "Built using Advanced Java.", category: "Full Stack Java", link: "https://github.com/Ayusjih", dates: "Academic Project" },
          { title: "Safety Chrome Extension", description: "Browser extension for web surfing safety.", category: "Cybersecurity", link: "https://github.com/Ayusjih", dates: "Extension" }
        ],
        achievements: ["Rank 1 (Winner): Hack-Arena Hackathon", "Rank 2: Cybersecurity Hackathon", "Successfully captained high-performing team"],
        guidance: [
          { source: "ITM Gwalior Faculty", description: "Academic Mentors", email: "admin@itmgwalior.ac.in", role: "Academic Mentors" }
        ]
      });
      
    } catch (error) {
      console.error('Error fetching developer data:', error);
      // If BE returns 401 (Unauthorized), log out the token
      if (error.response && error.response.status === 401) {
          handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (section) => {
    try {
      const token = localStorage.getItem('developerToken');
      // Prepare data (using spread to ensure all fields are sent)
      let itemToSend = { ...newItem };

      // API call to create new item (NOTE: Backend implementation required)
      // await axios.post(`${API_BASE_URL}/api/developer/data/${section}`, itemToSend, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // OPTIMISTIC UPDATE (For Dev): Append item to local data immediately
      setDeveloperData(prev => ({
        ...prev,
        [section]: isStringArray(section) ? [...prev[section], newItem.text] : [...prev[section], newItem]
      }));
      
      setNewItem({});
      setActiveSection(null);
      setMessage('✅ Item added successfully (Local)!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error adding item: ' + error.message);
    }
  };

  const deleteItem = async (section, index) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem('developerToken');
      // API call to delete (NOTE: Backend implementation required)
      // await axios.delete(`${API_BASE_URL}/api/developer/data/${section}/${index}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // OPTIMISTIC UPDATE (For Dev): Filter item from local data immediately
      setDeveloperData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
      
      setMessage('🗑️ Item deleted successfully (Local)!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error deleting item: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('developerToken');
    // Navigate back to the developer login prompt page
    navigate('/developers');
  };

  const handleBackToProfile = () => {
    // Navigate back to the public view of the developer page
    navigate('/developers'); 
  };
  
  const isStringArray = (section) => section === 'achievements';


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!developerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
             <div className="text-red-500 text-5xl mb-4">⚠️</div>
             <h2 className="text-xl font-bold text-gray-800 mb-2">Access Error</h2>
             <p className="text-gray-500 mb-6">Unable to load developer data. Please try logging in again.</p>
             <button onClick={handleLogout} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      {/* 1. Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBackToProfile}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                    <Icons.Back />
                    Back to Profile
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Developer Dashboard</h1>
            </div>
            
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
            >
                <Icons.Logout />
                Logout
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-3xl font-extrabold mb-2">Welcome Back, Developer! 🚀</h2>
                <p className="text-blue-100">Manage your portfolio content, update projects, and track your achievements all in one place.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="font-bold">Edit Mode Active</span>
                </div>
            </div>
        </div>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Education Editor */}
          <SectionEditor
            title="Education"
            icon={<Icons.Education />}
            color="blue"
            data={developerData.education}
            section="education"
            onAdd={addItem}
            onDelete={deleteItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            newItem={newItem}
            setNewItem={setNewItem}
          />

          {/* Projects Editor */}
          <SectionEditor
            title="Projects"
            icon={<Icons.Project />}
            color="purple"
            data={developerData.projects}
            section="projects"
            onAdd={addItem}
            onDelete={deleteItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            newItem={newItem}
            setNewItem={setNewItem}
          />

          {/* Achievements Editor */}
          <SectionEditor
            title="Achievements"
            icon={<Icons.Star />}
            color="orange"
            data={developerData.achievements}
            section="achievements"
            onAdd={addItem}
            onDelete={deleteItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            newItem={newItem}
            setNewItem={setNewItem}
            isStringArray={isStringArray('achievements')}
          />

          {/* Guidance Editor */}
          <SectionEditor
            title="Guidance"
            icon={<Icons.Users />}
            color="green"
            data={developerData.guidance}
            section="guidance"
            onAdd={addItem}
            onDelete={deleteItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            newItem={newItem}
            setNewItem={setNewItem}
          />
        </div>

      </div>

      {/* Floating Toast Notification */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in z-50 ${
          message.includes('✅') ? 'bg-green-600 text-white' : 
          message.includes('🗑️') ? 'bg-gray-800 text-white' : 
          'bg-red-600 text-white'
        }`}>
          <span className="text-lg">{message.includes('✅') ? '🎉' : message.includes('🗑️') ? '🗑️' : '⚠️'}</span>
          <p className="font-bold">{message.replace(/✅|🗑️|❌/g, '').trim()}</p>
        </div>
      )}
    </div>
  );
};

// Reusable Section Editor Component
const SectionEditor = ({ 
  title, 
  icon,
  color,
  data, 
  section, 
  onAdd, 
  onDelete, 
  activeSection, 
  setActiveSection, 
  newItem, 
  setNewItem, 
  isStringArray = false 
}) => {
  
  const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
      purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
      orange: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300',
      green: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300',
  };

  const btnColors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      green: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-lg flex flex-col h-full`}>
      
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                {icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{data.length}</span>
        </div>
        <button
          onClick={() => {
              setActiveSection(activeSection === section ? null : section);
              setNewItem({});
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSection === section 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : `${colors[color]} border`
          }`}
        >
          {activeSection === section ? 'Cancel' : <><Icons.Plus /> Add New</>}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-grow flex flex-col">
        {/* List of Items */}
        <div className="space-y-3 mb-6">
            {data.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-sm">No items found.</p>
                    <p className="text-xs mt-1">Click "Add New" to get started.</p>
                </div>
            )}

            {data.map((item, index) => (
            <div key={index} className="group flex justify-between items-start p-4 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl transition-all hover:shadow-md hover:border-gray-200">
                <div className="flex-1 pr-4">
                {isStringArray ? (
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">{item}</p>
                ) : (
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">
                            {item.institution || item.title || item.source}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {item.degree || item.description || item.category}
                        </p>
                        <div className="flex gap-2 mt-2">
                            {item.duration && <span className="text-[10px] bg-white border px-2 py-0.5 rounded text-gray-500 font-mono">{item.duration}</span>}
                            {item.cgpa && <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded font-bold">{item.cgpa}</span>}
                        </div>
                    </div>
                )}
                </div>
                <button
                    onClick={() => onDelete(section, index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Item"
                >
                    <Icons.Trash />
                </button>
            </div>
            ))}
        </div>

        {/* Add New Form (Expands at bottom) */}
        {activeSection === section && (
            <div className="mt-auto pt-6 border-t border-gray-100 animate-fade-in-up">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Create New Entry</h3>
            
            <div className="space-y-4">
                {/* DYNAMIC FORM FIELDS */}
                {isStringArray ? (
                    <textarea
                        value={newItem.text || ''}
                        onChange={(e) => setNewItem({ text: e.target.value })}
                        placeholder={`Describe the ${title.slice(0, -1).toLowerCase()}...`}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows="3"
                    />
                ) : section === 'education' ? (
                    <>
                        <input type="text" placeholder="Institution Name" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, institution: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Degree" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, degree: e.target.value})} />
                            <input type="text" placeholder="CGPA / Grade" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, cgpa: e.target.value})} />
                        </div>
                        <input type="text" placeholder="Duration (e.g., 2023-2027)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, duration: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Enrollment No." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, enrollment: e.target.value})} />
                            <input type="text" placeholder="Department" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, department: e.target.value})} />
                        </div>
                    </>
                ) : section === 'projects' ? (
                    <>
                        <input type="text" placeholder="Project Title" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Category (e.g., Full Stack)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, category: e.target.value})} />
                            <input type="text" placeholder="Dates (e.g., Jan 2024)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, dates: e.target.value})} />
                        </div>
                        <textarea placeholder="Project Description" rows="3" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                        <input type="text" placeholder="Project Link (URL)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, link: e.target.value})} />
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Name / Source" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, source: e.target.value})} />
                        <input type="text" placeholder="Role (e.g., Mentor)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, role: e.target.value})} />
                        <textarea placeholder="Description" rows="2" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                        <input type="email" placeholder="Email (Optional)" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" onChange={(e) => setNewItem({...newItem, email: e.target.value})} />
                    </>
                )}

                <button
                    onClick={() => onAdd(section)}
                    className={`w-full text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-transform active:scale-95 flex justify-center items-center gap-2 ${btnColors[color]}`}
                >
                    Save Entry
                </button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
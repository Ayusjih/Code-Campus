import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile, 
  signOut,
  getAuth, 
  setPersistence, 
  browserSessionPersistence 
} from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    rollNumber: "", branch: "CS", year: "1", semester: "1",
    leetcode: "", codechef: "", codeforces: "", hackerrank: "", geeksforgeeks: ""
  });

  const [semOptions, setSemOptions] = useState([1, 2]);

  useEffect(() => {
    const y = parseInt(formData.year);
    setSemOptions([(y * 2) - 1, y * 2]);
    setFormData(prev => ({ ...prev, semester: (y * 2) - 1 }));
  }, [formData.year]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match!");
    
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      await updateProfile(user, { displayName: formData.fullName });

      await axios.post("http://localhost:5000/api/users/sync", {
        firebase_uid: user.uid,
        email: user.email,
        full_name: formData.fullName,
        enrollment_number: formData.rollNumber,
        branch: formData.branch,
        academic_year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      });

      const platforms = [
        { name: 'LeetCode', handle: formData.leetcode },
        { name: 'CodeChef', handle: formData.codechef },
        { name: 'Codeforces', handle: formData.codeforces },
        { name: 'HackerRank', handle: formData.hackerrank },
        { name: 'GeeksForGeeks', handle: formData.geeksforgeeks }
      ];

      for (const p of platforms) {
        if (p.handle) {
          try {
            await axios.post("http://localhost:5000/api/platforms/connect", {
                firebase_uid: user.uid,
                platform: p.name,
                username: p.handle
            });
          } catch (err) { console.error(`Failed to connect ${p.name}`); }
        }
      }

      await signOut(auth); 
      alert("Registration Successful! Please verify your email before logging in.");
      navigate("/login"); 

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || error.message;
      alert(msg.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
      
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#60A5FA 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-600/40 mb-4">
                <span className="text-2xl font-bold text-white">{"</>"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Join Code-Campus</h2>
            <p className="text-blue-200 mt-2 text-sm md:text-base">Create your student profile to track progress & compete.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          
          {/* 1. Account Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-4">
                <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input name="fullName" placeholder="Full Name" required className="glass-input" onChange={handleChange} />
              <input name="rollNumber" placeholder="Roll Number" required className="glass-input" onChange={handleChange} />
              <input name="email" type="email" placeholder="Email Address" required className="glass-input md:col-span-2" onChange={handleChange} />
              <input name="password" type="password" placeholder="Password" required className="glass-input" onChange={handleChange} />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="glass-input" onChange={handleChange} />
            </div>
          </div>

          {/* 2. Academic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Academic Info</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="relative">
                    <select name="branch" className="glass-input appearance-none cursor-pointer" onChange={handleChange}>
                        <option className="text-gray-900" value="CS">Computer Science</option>
                        <option className="text-gray-900" value="IT">Information Tech</option>
                        <option className="text-gray-900" value="ME">Mechanical</option>
                        <option className="text-gray-900" value="CIVIL">Civil</option>
                        <option className="text-gray-900" value="AIML">AI & ML</option>
                        <option className="text-gray-900" value="IOT">IoT</option>
                    </select>
                </div>
                <div className="relative">
                    <select name="year" className="glass-input appearance-none cursor-pointer" onChange={handleChange}>
                        <option className="text-gray-900" value="1">1st Year</option>
                        <option className="text-gray-900" value="2">2nd Year</option>
                        <option className="text-gray-900" value="3">3rd Year</option>
                        <option className="text-gray-900" value="4">4th Year</option>
                    </select>
                </div>
                <div className="relative">
                    <select name="semester" className="glass-input appearance-none cursor-pointer" value={formData.semester} onChange={handleChange}>
                        {semOptions.map(sem => (
                            <option className="text-gray-900" key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>
          </div>

          {/* 3. Coding Handles Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-4">
                <div className="p-1.5 bg-green-500/20 rounded-lg text-green-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Coding Handles</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <input name="leetcode" placeholder="LeetCode Username" className="glass-input" onChange={handleChange} />
              <input name="codechef" placeholder="CodeChef Handle" className="glass-input" onChange={handleChange} />
              <input name="codeforces" placeholder="Codeforces Handle" className="glass-input" onChange={handleChange} />
              <input name="hackerrank" placeholder="HackerRank Username" className="glass-input" onChange={handleChange} />
              <input name="geeksforgeeks" placeholder="GFG Handle" className="glass-input" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 active:scale-95">
            {loading ? "Creating Profile..." : "Complete Registration"}
          </button>
        </form>

        <p className="text-center mt-8 text-blue-200">
          Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Login here</Link>
        </p>
      </div>

      <style>{`
        .glass-input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.3s ease;
        }
        .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        .glass-input:focus {
            background: rgba(0, 0, 0, 0.4);
            border-color: #3B82F6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Register;
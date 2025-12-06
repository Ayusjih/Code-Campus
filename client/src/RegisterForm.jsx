// [2025-12-06 22:10] client/src/RegisterForm.jsx
// Description: Updated to send Integer Year and correct data types.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roll_number: "",
    branch: "CSE",
    semester: "3", // String "3" is okay, DB converts it usually, but better to be safe
    year: "2",     // Fixed: Default "2" (String representing number)
    leetcode_handle: "",
    codeforces_handle: "",
    codechef_handle: "",
    hackerrank_handle: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });
      const token = await user.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          roll_number: formData.roll_number,
          branch: formData.branch,
          semester: parseInt(formData.semester), // Ensure Int
          year: parseInt(formData.year),         // Ensure Int for DB
          leetcode_handle: formData.leetcode_handle,
          codeforces_handle: formData.codeforces_handle,
          codechef_handle: formData.codechef_handle,
          hackerrank_handle: formData.hackerrank_handle
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed on server");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");

    } catch (err) {
      console.error("Registration Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please login.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Join Code Campus</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input type="text" name="name" onChange={handleChange} required className="w-full px-3 py-2 border rounded shadow-sm" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-3 py-2 border rounded shadow-sm" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-3 py-2 border rounded shadow-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-gray-700 text-sm font-bold mb-2">Roll Number</label>
               <input type="text" name="roll_number" onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
               <label className="block text-gray-700 text-sm font-bold mb-2">Year</label>
               <select name="year" onChange={handleChange} className="w-full px-3 py-2 border rounded">
                 <option value="1">1st Year</option>
                 <option value="2">2nd Year</option>
                 <option value="3">3rd Year</option>
                 <option value="4">4th Year</option>
               </select>
            </div>
          </div>
           {/* Coding Handles Inputs... (Same as before) */}
           <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Coding Handles (Optional)</h3>
            <input type="text" name="leetcode_handle" placeholder="LeetCode Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
            <input type="text" name="codeforces_handle" placeholder="CodeForces Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
            <input type="text" name="codechef_handle" placeholder="CodeChef Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </div>
        <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
// [2025-12-06 21:15] client/src/RegisterForm.jsx
// Description: Updated Register form using Firebase Auth instead of OTP.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase"; // Importing configured firebase instance

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roll_number: "",
    branch: "CSE",
    semester: "3",
    year: "2nd",
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
      // 1. Firebase se User Create karo
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Firebase Profile update karo (Name set karo)
      await updateProfile(user, {
        displayName: formData.name,
      });

      // 3. User ka token nikalo
      const token = await user.getIdToken();

      // 4. Backend ko data bhejo (PostgreSQL me store karne ke liye)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Token bhej rahe hain verification ke liye
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          roll_number: formData.roll_number,
          branch: formData.branch,
          semester: formData.semester,
          year: formData.year,
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

      // 5. Success! Dashboard par bhejo
      // LocalStorage me user info save kar sakte ho agar zaroorat ho
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
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Join Code Campus
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="college@email.com"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-gray-700 text-sm font-bold mb-2">Roll Number</label>
               <input type="text" name="roll_number" onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
               <label className="block text-gray-700 text-sm font-bold mb-2">Semester</label>
               <select name="semester" onChange={handleChange} className="w-full px-3 py-2 border rounded">
                 <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                 <option value="4">4</option><option value="5">5</option><option value="6">6</option>
                 <option value="7">7</option><option value="8">8</option>
               </select>
            </div>
          </div>

          {/* Coding Handles - Optional */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Coding Handles (Optional)</h3>
            <input type="text" name="leetcode_handle" placeholder="LeetCode Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
            <input type="text" name="codeforces_handle" placeholder="CodeForces Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
            <input type="text" name="codechef_handle" placeholder="CodeChef Username" onChange={handleChange} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
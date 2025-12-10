import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- STATIC IMPORTS (Core components needed immediately) ---
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import TeacherRoute from "./components/TeacherRoute";
import Home from "./pages/Home"; // Keep Home static for fast first load

// --- LAZY IMPORTS (Pages loaded on demand) ---
// This splits the code bundle, making the initial load much faster
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Contests = lazy(() => import("./pages/Contests"));
const Developers = lazy(() => import("./pages/Developers"));
const DeveloperDashboard = lazy(() => import("./pages/DeveloperDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Profile = lazy(() => import("./pages/Profile"));
// --- LOADING SPINNER ---
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      {/* Simple CSS Spinner */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="app-container font-sans text-gray-900 bg-gray-50 min-h-screen">
      
      {/* Global Navbar */}
      <Navbar />

      {/* SUSPENSE WRAPPER: Must wrap the Routes to handle the lazy loading */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/developers" element={<Developers />} />
          

          {/* --- STUDENT PROTECTED ROUTES --- */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
  path="/profile" 
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  } 
/>
          <Route 
            path="/leaderboard" 
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/edit-profile" 
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/contests" 
            element={
              <PrivateRoute>
                <Contests />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } 
          />

          {/* --- DEVELOPER PROTECTED ROUTE --- */}
          <Route 
            path="/developer-dashboard" 
            element={
              <PrivateRoute>
                <DeveloperDashboard />
              </PrivateRoute>
            } 
          />

          {/* --- TEACHER PROTECTED ROUTE (Role Based) --- */}
          <Route 
            path="/teacher-dashboard" 
            element={
              <TeacherRoute>
                <TeacherDashboard />
              </TeacherRoute>
            } 
          />

          {/* --- FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
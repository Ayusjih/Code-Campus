import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const TeacherRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await axios.get(`http://localhost:5000/api/platforms/role/${user.uid}`);
          console.log("Frontend Role Check:", res.data.role); // Debug Log
          
          if (res.data.role === 'teacher') {
            setIsTeacher(true);
          } else {
            setIsTeacher(false);
          }
        } catch (error) {
          console.error("Role check failed", error);
          setIsTeacher(false);
        }
      } else {
        setIsTeacher(false);
      }
      setLoading(false); // Stop loading regardless of result
    });

    return () => unsubscribe();
  }, []); // Run once on mount

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Checking permissions...</div>;
  }

  // If not teacher, redirect to Dashboard
  return isTeacher ? children : <Navigate to="/dashboard" replace />;
};

export default TeacherRoute;
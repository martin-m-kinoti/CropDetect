import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import SignIn from "./components/Signin";
import AIModel from "./components/AIModel";
import Documentation from "./components/Doc";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./components/Admin";


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />

        <Route
          path="/signin"
          element={user ? <Navigate to="/ai-model" /> : <SignIn />}
        />
        <Route path="/admin" element={<Admin user={user} />} />

        <Route path="/ai-model" element={<ProtectedRoute user={user}><AIModel user={user} /></ProtectedRoute>} />

        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </Router>
  );
}

export default App;
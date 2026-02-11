import React from "react";  
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/Signup';
import SignIn from './components/Signin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  )
}

export default App;
import React from "react";  
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUp from './components/Signup';
import SignIn from './components/Signin';
import AIModel from './components/AIModel';
import Documentation from './components/Doc';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/ai-model" element={<AIModel />} />
        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </Router>
  )
}

export default App;
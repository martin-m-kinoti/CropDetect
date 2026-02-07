import React from "react";
import '../App.css';
import { Link } from "react-router-dom";    
import { Search } from "lucide-react";

function Dashboard() {


    return (
        <>
            <div className="nav-bar">
                <div className="logo-image-section">
                    <img src="/logo.png" alt="crop-detect-logo" className="logo-image"/>
                </div>
                <p className="logo">Crop Detect</p>
                <Link to="#about-section">About</Link>
                <Link to='/signin'>Sign In</Link>
                <Link to="/ai-model">AI Model</Link>

                {/*Search bar*/ }
                <div className="search-bar-section">
                    <Search className="search-icon" size={18}></Search>
                    <input 
                    type="text"
                    placeholder="Search..."
                    className="search-bar" 
                    />
                </div>

            </div>
        </>
    )
}

export default Dashboard;
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Navbar.css";
import LogoImg from "../assets/JetGenieLogo.png";

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      {/* Left Side - Logo */}
      <div className="nav-left">
        <Link to="/">
          <img src={LogoImg} alt="Logo" className="nav-logo" />
        </Link>
      </div>

      {/* Right Side - Authentication and Navigation Links */}
      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <Link to="/saved-trips" className="nav-button">Saved Trips</Link>
            <Link to="/plan-trip" className="nav-button">Plan a Trip</Link>
            <button className="nav-button logout" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">Sign Up</Link>
            <Link to="/login" className="nav-button">Log In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

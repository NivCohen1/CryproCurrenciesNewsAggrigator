import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../styles/Header.css";

const Header = ({ isLoggedIn, user }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleSignUpClick = () => navigate("/signup");
  const handleProfilePageClick = () => navigate("/profile");

  const handleLogoutClick = () => {
    auth.signOut()
      .then(() => {
        // After successful logout, navigate to the home or login page
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <header className="auth-header">
      {isLoggedIn ? (
        <div className="auth-logged-in">
          <span className="user-name">{user?.displayName || user?.email}</span>
          <button className="auth-button profile" onClick={handleProfilePageClick}>
            Profile
          </button>
          <button className="auth-button logout" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-buttons">
          <button className="auth-button login" onClick={handleLoginClick}>
            Login
          </button>
          <button className="auth-button signup" onClick={handleSignUpClick}>
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;

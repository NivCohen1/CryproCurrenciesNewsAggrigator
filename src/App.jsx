import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import HomePage from "./pages/HomePage";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage"; // Import the search page
import Footer from "./components/footer"; // Import Footer

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await auth.signOut(); // Sign out the user before the page unloads
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
        <Footer /> {/* Footer placed here */}
      </div>
    </Router>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Make sure db is imported for firestore
import { doc, getDoc } from "firebase/firestore";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  
  // News states
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User's favorites
  const [userFavorites, setUserFavorites] = useState([]);



  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        fetchUserFavorites(currentUser.uid); // Fetch user's favorites on login
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's favorite cryptocurrencies from Firestore
  const fetchUserFavorites = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      setUserFavorites(userDoc.data().favorites || []);
    }
  };

  // Fetch cryptocurrency list
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/all/coinlist?api_key=e084bcc89f0bf7339cebbc2c3c3ae2bd80cf3e0fbf3b1d89301c17f20e231c1c`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const cryptoNames = Object.values(data.Data).map((coin) => coin.CoinName);
        setCryptos(cryptoNames);
        
        const topCategories = Object.values(data.Data)
          .slice(0, 10)
          .map(coin => coin.CoinName);
        setCategories(['All', ...topCategories]);
      } catch (error) {
        console.error("Error fetching cryptocurrency list:", error);
        setError("Failed to fetch cryptocurrencies");
      }
    };

    fetchCryptos();
  }, []);

  // Fetch news with auto-refresh
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const category = selectedCategory === 'all' ? '' : selectedCategory;
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/v2/news/?categories=${category}&api_key=e084bcc89f0bf7339cebbc2c3c3ae2bd80cf3e0fbf3b1d89301c17f20e231c1c`
        );
        const data = await response.json();
        let fetchedNews = data.Data || [];

        // Filter the news based on the user's selected favorite cryptos
        if (userFavorites.length > 0) {
          fetchedNews = fetchedNews.filter((article) =>
            userFavorites.some((crypto) =>
              article.title.toLowerCase().includes(crypto.toLowerCase())
            )
          );
        }

        setNews(fetchedNews);
      } catch (err) {
        setError('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [selectedCategory, userFavorites]); // Re-fetch news when favorites change

  // Handle search functionality
  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (input) {
      const matches = cryptos.filter((crypto) =>
        crypto.toLowerCase().startsWith(input.toLowerCase())
      );
      setFilteredCryptos(matches.slice(0, 10));
    } else {
      setFilteredCryptos([]);
    }
  };

  const handleSearch = () => {
    const isValidCrypto = cryptos.some(
      (crypto) => crypto.toLowerCase() === searchTerm.toLowerCase()
    );

    if (isValidCrypto) {
      navigate(`/search?crypto=${searchTerm}`);
    } else {
      alert("Please select a valid cryptocurrency from the list.");
    }
  };

  const handleSearchSelect = (crypto) => {
    setSearchTerm(crypto);
    setFilteredCryptos([]);
  };

  // Navigation handlers
  const handleLoginClick = () => navigate("/login");
  const handleSignUpClick = () => navigate("/signup");
  const handleProfilePageClick = () => navigate("/profile");

  return (
    <div className="home-container">
      {/* Auth header */}
      <header className="auth-header">
        {isLoggedIn ? (
          <div className="auth-logged-in">
            <span className="user-name">{user.displayName || user.email}</span>
            <button className="auth-button profile" onClick={handleProfilePageClick}>
              Profile
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="auth-button login" onClick={handleLoginClick}>Login</button>
            <button className="auth-button signup" onClick={handleSignUpClick}>Sign Up</button>
          </div>
        )}
      </header>

      <main className="main-content">
        {/* Header section */}
        <section className="header-section">
          <img src="/logo.png" alt="CryptoHive Logo" className="logo" />
          <h1 className="site-title">CryptoHive</h1>
          <p className="site-description">Your gateway to cryptocurrency insights and trends.</p>
          
          <div className="search-container">
            <input 
              type="text"
              className="search-input"
              placeholder="Search for a cryptocurrency..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-button" onClick={handleSearch}>Search</button>
            
            {filteredCryptos.length > 0 && (
              <ul className="dropdown-menu">
                {filteredCryptos.map((crypto, index) => (
                  <li 
                    key={index} 
                    className="dropdown-item" 
                    onClick={() => handleSearchSelect(crypto)}
                  >
                    {crypto}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="news-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="news-grid">
              {news.map((article, index) => (
                <article key={index} className="news-card">
                  <img 
                    src={article.imageurl || "/api/placeholder/400/200"}
                    alt={article.title}
                    className="news-image"
                  />
                  <div className="news-content">
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-description">{article.body}</p>
                    <div className="news-footer">
                      <span className="news-date">
                        {new Date(article.published_on * 1000).toLocaleDateString()}
                      </span>
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

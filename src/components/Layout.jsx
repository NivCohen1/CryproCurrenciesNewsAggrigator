import React from "react";
import Header from "./Header";
import { auth } from "../firebase";

const Layout = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="layout-container">
      <Header isLoggedIn={isLoggedIn} user={user} />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;

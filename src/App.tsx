import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Group from "./pages/groups/Group";
import JoinGroup from "./pages/groups/JoinGroup";
import CreateGroup from "./pages/groups/CreateGroup";
import SplashScreen from "./components/SplashScreen";

const App: React.FC = () => {
  const [loading, setLoading] = useState(() => {
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    return !hasSeenSplash;
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        localStorage.setItem("hasSeenSplash", "true");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groups/:groupId/*" element={<Group />} />
        <Route path="/join-group" element={<JoinGroup />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </div>
  );
};

export default App;

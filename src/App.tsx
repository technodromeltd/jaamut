import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Group from "./pages/groups/Group";
import JoinGroup from "./pages/groups/JoinGroup";
import CreateGroup from "./pages/groups/CreateGroup";
import SplashScreen from "./components/SplashScreen";

const SHOW_SPLASH = true;
const App: React.FC = () => {
  const [loading, setLoading] = useState(SHOW_SPLASH);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // Set loading to false after 2 seconds
    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return <SplashScreen />; // Show SplashScreen while loading
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

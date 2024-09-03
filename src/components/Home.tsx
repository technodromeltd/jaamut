import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentGroups } from "../utils/storage";
import Button from "./Button";
import logo from "../assets/logo.png";

const Home: React.FC = () => {
  const [recentGroups, setRecentGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentGroups(getRecentGroups());
  }, []);

  return (
    <div className="container mx-auto p-4 mt-4">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="Bill Splitter Logo" className="h-24" />
      </div>
      <p className="mb-8">
        WANDERWALLET is a travel expense tracker for groups with intelligent
        receipt scanning for easiest logging and settlement counting for getting
        even.
      </p>

      <div className="space-y-4 mb-8">
        <Button
          onClick={() => navigate("/create-group")}
          variant="primary"
          fullWidth
        >
          Create a Group
        </Button>
        <Button
          onClick={() => navigate("/join-group")}
          variant="secondary"
          fullWidth
        >
          Join a Group
        </Button>
      </div>

      {recentGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Recent Groups</h2>
          <ul className="space-y-2">
            {recentGroups.map((group) => (
              <li key={group.id}>
                <Button
                  onClick={() => navigate(`/groups/${group.id}`)}
                  variant="secondary"
                  fullWidth
                >
                  {group.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;

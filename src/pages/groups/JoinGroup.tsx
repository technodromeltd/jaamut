import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import NavBar from "../../components/NavBar";

const JoinGroup: React.FC = () => {
  const [joinGroupName, setJoinGroupName] = useState("");
  const navigate = useNavigate();

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/groups/${joinGroupName}`);
  };

  return (
    <>
      <NavBar headerText="Joining group" />
      <div className="container mx-auto p-4 flex flex-col justify-center h-screen w-full">
        <form onSubmit={handleJoinGroup} className="space-y-4 mb-8">
          <input
            type="text"
            value={joinGroupName}
            onChange={(e) => setJoinGroupName(e.target.value)}
            placeholder="Enter group code"
            className="p-2 w-full text-xl text-center"
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Join Group
          </Button>
        </form>
      </div>
    </>
  );
};

export default JoinGroup;

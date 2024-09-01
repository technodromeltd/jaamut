import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Home from "./components/Home";
import Group from "./components/Group";
import GroupSettings from "./components/GroupSettings";
import GroupScore from "./components/GroupScore";
import { getGroup, updateGroup, User, GroupData } from "./utils/storage";
import { useQuery, useMutation, useQueryClient } from "react-query";
import Loading from "./components/Loading";
import GroupNotFound from "./components/GroupNotFound";
import TransactionList from "./components/TransactionList";

const GroupSettingsWrapper: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();

  const { data: groupData, isLoading } = useQuery(["group", groupId], () =>
    getGroup(groupId!)
  );

  const mutation = useMutation(
    (updatedGroupData: Omit<GroupData, "id">) =>
      updateGroup(groupId!, updatedGroupData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["group", groupId]);
      },
    }
  );

  const handleAddUser = async (newUser: User) => {
    if (groupData) {
      const updatedUsers = [...groupData.users, newUser];
      mutation.mutate({ ...groupData, users: updatedUsers });
    }
  };

  if (isLoading) return <Loading />;
  if (!groupData) return <GroupNotFound />;

  return (
    <GroupSettings
      users={groupData.users}
      onAddUser={handleAddUser}
      groupName={groupData.name}
    />
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groups/:groupId" element={<Group />} />
        <Route
          path="/groups/:groupId/settings"
          element={<GroupSettingsWrapper />}
        />
        <Route path="/groups/:groupId/score" element={<GroupScore />} />
        <Route
          path="/groups/:groupId/transactions"
          element={<TransactionList />}
        />
      </Routes>
    </div>
  );
};

export default App;

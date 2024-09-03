import React, { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import TransactionInput from "../../components/TransactionInput";
import GroupLayout from "../../components/GroupLayout";
import {
  Transaction,
  updateGroup,
  getGroup,
  GroupData,
  User,
  TransactionToSave,
} from "../../utils/storage";
import { useQuery, useMutation, useQueryClient } from "react-query";
import Loading from "../../components/Loading";
import GroupNotFound from "../../components/GroupNotFound";
import TransactionList from "./TransactionList";
import GroupScore from "./GroupScore";
import GroupSettings from "./GroupSettings";
import { Currency } from "../../utils/currencyConversion";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import logo from "../../assets/logo.png";
const GroupSettingsWrapper: React.FC<{ groupId: string }> = ({ groupId }) => {
  const queryClient = useQueryClient();

  const { data: groupData, isLoading } = useQuery(["group", groupId], () =>
    getGroup(groupId)
  );

  const mutation = useMutation(
    (updatedGroupData: Omit<GroupData, "id">) =>
      updateGroup(groupId, updatedGroupData),
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

  const handleUpdateDefaultCurrency = (currency: Currency) => {
    if (groupData) {
      mutation.mutate({ ...groupData, defaultCurrency: currency });
    }
  };

  if (isLoading) return <Loading />;
  if (!groupData) return <GroupNotFound />;

  return (
    <GroupSettings
      users={groupData.users}
      onAddUser={handleAddUser}
      groupName={groupData.name}
      defaultCurrency={groupData.defaultCurrency}
      onUpdateDefaultCurrency={handleUpdateDefaultCurrency}
    />
  );
};

const Group: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const { canInstall, handleInstall, setBlocked, blocked } = usePWAInstall();
  const [hasPrompted, setHasPrompted] = useState(false);

  const handlePromptInstall = () => {
    if (canInstall && !hasPrompted) {
      setHasPrompted(true);

      handleInstall(); // Call handleInstall directly in response to user action
    }
  };

  const handleBlockInstall = () => {
    setBlocked();
  };

  useEffect(() => {
    console.log("user can install", canInstall);
  }, [canInstall]);

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery(["group", groupId], () => getGroup(groupId!));

  const mutation = useMutation(
    (newGroupData: Omit<GroupData, "id">) =>
      updateGroup(groupId!, newGroupData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["group", groupId]);
      },
    }
  );

  const handleAddTransaction = (transaction: TransactionToSave) => {
    if (groupData) {
      const newTransaction: Transaction = {
        id: Date.now(),
        ...transaction,
      };
      const newTransactions = [...groupData.transactions, newTransaction];
      mutation.mutate({ ...groupData, transactions: newTransactions });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-end h-screen">
        <img src={logo} alt="WanderWallet Logo" className="h-12 mb-6" />
        <Loading />
      </div>
    );
  if (error || !groupData) return <GroupNotFound />;

  return (
    <>
      {canInstall && !blocked && (
        <div className="w-full flex gap-2 justify-between p-2 bg-secondary-button">
          <button onClick={handlePromptInstall}>Install App</button>
          <span onClick={handleBlockInstall} className="text-white">
            X
          </span>
        </div>
      )}
      <GroupLayout groupId={groupId!} groupName={groupData.name}>
        <Routes>
          <Route
            path="/"
            element={
              <TransactionInput
                onAddTransaction={handleAddTransaction}
                users={groupData.users}
              />
            }
          />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/score" element={<GroupScore />} />
          <Route
            path="/settings"
            element={<GroupSettingsWrapper groupId={groupId!} />}
          />
        </Routes>
      </GroupLayout>
    </>
  );
};

export default Group;

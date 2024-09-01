import React from "react";
import { useParams } from "react-router-dom";
import TransactionInput from "./TransactionInput";
import GroupLayout from "./GroupLayout";
import {
  Transaction,
  updateGroup,
  getGroup,
  GroupData,
} from "../utils/storage";
import { useQuery, useMutation, useQueryClient } from "react-query";
import Loading from "./Loading";
import GroupNotFound from "./GroupNotFound";

const Group: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();

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

  const handleAddTransaction = (
    amount: number,
    currency: string,
    message: string,
    userId: string
  ) => {
    if (groupData) {
      const newTransaction: Transaction = {
        id: Date.now(),
        amount,
        currency,
        message,
        userId,
        datetime: new Date().toISOString(),
      };
      const newTransactions = [...groupData.transactions, newTransaction];
      mutation.mutate({ ...groupData, transactions: newTransactions });
    }
  };

  if (isLoading) return <Loading />;
  if (error || !groupData) return <GroupNotFound />;

  return (
    <GroupLayout groupId={groupId!} groupName={groupData.name}>
      <TransactionInput
        onAddTransaction={handleAddTransaction}
        users={groupData.users}
      />
    </GroupLayout>
  );
};

export default Group;

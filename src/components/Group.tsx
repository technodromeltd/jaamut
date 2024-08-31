import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TransactionInput from "./TransactionInput";
import GroupLayout from "./GroupLayout";
import DeleteConfirmation from "./DeleteConfirmation";
import Button from "./Button";
import {
  Transaction,
  updateGroup,
  getGroup,
  GroupData,
  addRecentGroup,
} from "../utils/storage";
import { useQuery, useMutation, useQueryClient } from "react-query";

const Group: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(
    null
  );

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery(["group", groupId], () => getGroup(groupId!), {
    onSuccess: (data) => {
      if (data) {
        addRecentGroup(data.id, data.name);
      }
    },
  });

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

  const handleDeleteTransaction = (transactionId: number) => {
    setDeleteConfirmation(transactionId);
  };

  const confirmDelete = () => {
    if (groupData && deleteConfirmation) {
      const newTransactions = groupData.transactions.filter(
        (t) => t.id !== deleteConfirmation
      );
      mutation.mutate({ ...groupData, transactions: newTransactions });
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !groupData) return <div>Error loading group data</div>;

  return (
    <GroupLayout groupId={groupId!} groupName={groupData.name}>
      <TransactionInput
        onAddTransaction={handleAddTransaction}
        users={groupData.users}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        {groupData.transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border border-primary-text p-2 mb-2 rounded flex justify-between items-center"
          >
            <div>
              <p>
                {transaction.amount} {transaction.currency} -{" "}
                {transaction.message}
              </p>
              <p>
                By:{" "}
                {groupData.users.find((u) => u.id === transaction.userId)?.name}{" "}
                at {new Date(transaction.datetime).toLocaleString()}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleDeleteTransaction(transaction.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {deleteConfirmation && (
        <DeleteConfirmation onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </GroupLayout>
  );
};

export default Group;

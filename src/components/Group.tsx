import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TransactionInput from "./TransactionInput";
import GroupLayout from "./GroupLayout";
import DeleteConfirmation from "./DeleteConfirmation";
import TransactionDetails from "./TransactionDetails";

import {
  Transaction,
  updateGroup,
  getGroup,
  GroupData,
  addRecentGroup,
} from "../utils/storage";
import { useQuery, useMutation, useQueryClient } from "react-query";
import Loading from "./Loading";
import GroupNotFound from "./GroupNotFound";
import { settings } from "../settings/settings";

const Group: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  if (isLoading) return <Loading />;
  if (error || !groupData) return <GroupNotFound />;

  return (
    <GroupLayout groupId={groupId!} groupName={groupData.name}>
      <TransactionInput
        onAddTransaction={handleAddTransaction}
        users={groupData.users}
      />

      {/* <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        {groupData.transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border-primary-text p-2 mb-2 rounded transition-colors duration-200 cursor-pointer flex items-center"
            onClick={() => setSelectedTransaction(transaction)}
          >
            <div
              className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: getUserColor(transaction.userId) }}
            ></div>
            <div className="flex justify-between items-center flex-grow">
              <p className="font-normal">{transaction.message}</p>
              <div className="text-sm text-white flex justify-between items-center">
                <p className="font-bold text-xl pr-4">
                  {transaction.amount} {transaction.currency}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmation && (
        <DeleteConfirmation onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          user={groupData.users.find(
            (u) => u.id === selectedTransaction.userId
          )}
          onClose={() => setSelectedTransaction(null)}
          onDelete={handleDeleteTransaction}
        />
      )} */}
    </GroupLayout>
  );
};

export default Group;

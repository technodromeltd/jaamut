import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import TransactionDetails from "../../components/TransactionDetails";
import TransactionEdit from "../../components/TransactionEdit";
import {
  Transaction,
  GroupData,
  User,
  updateGroup,
  addRecentGroup,
  getGroup,
} from "../../utils/storage";
import { settings } from "../../settings/settings";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { convertCurrency, Currency } from "../../utils/currencyConversion";
import CategoryIcon from "../../components/Category";

const TransactionList: React.FC = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newGroupData: Omit<GroupData, "id">) =>
      updateGroup(groupId!, newGroupData),
    {
      onSuccess: (_, variables) => {
        // Update the cache immediately with the new data
        queryClient.setQueryData(["group", groupId], {
          ...variables,
          id: groupId,
        });
        // Also invalidate to ensure we have the latest data
        queryClient.invalidateQueries(["group", groupId]);
      },
    }
  );
  const { groupId } = useParams<{ groupId: string }>();

  const { data: groupData } = useQuery(
    ["group", groupId],
    () => getGroup(groupId!),
    {
      onSuccess: (data) => {
        if (data) {
          addRecentGroup(data.id, data.name);
        }
      },
    }
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleDeleteTransaction = (transactionId: number) => {
    setDeleteConfirmation(transactionId);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedTransaction(null);
  };

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    if (groupData) {
      const newTransactions = groupData.transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      );
      mutation.mutate({ ...groupData, transactions: newTransactions });
      setEditingTransaction(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const getUserColor = (userId: string) => {
    const userIndex =
      groupData?.users.findIndex((user) => user.id === userId) ?? 0;
    return settings.userColors[userIndex % settings.userColors.length];
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

  const sortedTransactions = groupData?.transactions
    ? [...groupData.transactions].sort((a, b) => {
        return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
      })
    : undefined;
  const transactionsGroupedByDate = sortedTransactions?.reduce(
    (acc, transaction) => {
      // Ensure we have a valid datetime string
      if (!transaction.datetime) {
        console.warn("Transaction missing datetime:", transaction);
        return acc;
      }

      const date = transaction.datetime.split("T")[0];
      if (!acc[date]) {
        acc[date] = { transactions: [], totalSum: 0 };
      }
      acc[date].transactions.push(transaction);
      return acc;
    },
    {} as { [key: string]: { transactions: Transaction[]; totalSum: number } }
  );

  const countTotalSumInCurrency = (
    transactions: Transaction[],
    currency: Currency
  ) => {
    return transactions.reduce((acc, transaction) => {
      const exchangeRate = convertCurrency(
        transaction.amount,
        transaction.currency,
        currency
      );
      return acc + exchangeRate;
    }, 0);
  };

  const dateSums =
    transactionsGroupedByDate &&
    Object.entries(transactionsGroupedByDate).map(
      ([date, { transactions }]) => {
        const totalSum = countTotalSumInCurrency(
          transactions,
          groupData?.defaultCurrency || "EUR"
        );
        const totalSumFormatted = totalSum.toFixed(2);

        // Calculate unique participants for this date
        const allParticipants = new Set<string>();
        transactions.forEach((transaction) => {
          transaction.participants?.forEach((participantId) => {
            allParticipants.add(participantId);
          });
        });

        const participantCount = allParticipants.size;
        const perPersonShare =
          participantCount > 0
            ? (totalSum / participantCount).toFixed(2)
            : "0.00";

        return {
          date,
          totalSum: totalSumFormatted,
          participantCount,
          perPersonShare,
        };
      }
    );

  return (
    <div className="">
      <h1>{`Transactions (${groupData?.transactions.length})`}</h1>
      <p>List of all transactions in the group by date.</p>
      {transactionsGroupedByDate &&
        Object.entries(transactionsGroupedByDate).map(
          ([date, { transactions }]) => (
            <div key={date}>
              <h2>
                {new Date(date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <p className="text-sm">
                  Total spent:{" "}
                  <b>
                    {
                      dateSums?.find((dateSum) => dateSum.date === date)
                        ?.totalSum
                    }{" "}
                    {groupData?.defaultCurrency}
                  </b>
                  <br />
                  <span className="text-xs opacity-75">
                    Per person:{" "}
                    {
                      dateSums?.find((dateSum) => dateSum.date === date)
                        ?.perPersonShare
                    }{" "}
                    {groupData?.defaultCurrency}(
                    {
                      dateSums?.find((dateSum) => dateSum.date === date)
                        ?.participantCount
                    }{" "}
                    participants)
                  </span>
                </p>
              </h2>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border-primary-text p-2 mb-2 rounded transition-colors duration-200 cursor-pointer flex items-center bg-secondary-button"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <CategoryIcon
                    category={transaction.category}
                    color={getUserColor(transaction.userId)}
                  />

                  <div className="flex justify-between items-center flex-grow">
                    <span className="font-normal">
                      {transaction.message.length > 20
                        ? `${transaction.message.slice(0, 20)}...`
                        : transaction.message || "Unknown"}
                    </span>
                    <div className="text-sm text-white flex justify-between items-center">
                      <span className="font-bold text-xl pr-4">
                        {transaction.amount.toLocaleString()}{" "}
                        {transaction.currency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      {deleteConfirmation && (
        <DeleteConfirmation onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          user={
            groupData?.users.find(
              (u) => u.id === selectedTransaction.userId
            ) as User
          }
          users={groupData?.users || []}
          onClose={() => setSelectedTransaction(null)}
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
        />
      )}

      {editingTransaction && (
        <TransactionEdit
          transaction={editingTransaction}
          users={groupData?.users || []}
          onSave={handleSaveTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionList;

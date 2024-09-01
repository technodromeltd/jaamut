import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GroupLayout from "./GroupLayout";
import DeleteConfirmation from "./DeleteConfirmation";
import TransactionDetails from "./TransactionDetails";
import {
  Transaction,
  GroupData,
  User,
  updateGroup,
  addRecentGroup,
  getGroup,
} from "../utils/storage";
import { settings } from "../settings/settings";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { convertCurrency } from "../utils/currencyConversion";

const TransactionList: React.FC = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newGroupData: Omit<GroupData, "id">) =>
      updateGroup(groupId!, newGroupData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["group", groupId]);
      },
    }
  );
  const { groupId } = useParams<{ groupId: string }>();

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
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleDeleteTransaction = (transactionId: number) => {
    setDeleteConfirmation(transactionId);
    setSelectedTransaction(null);
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

  const sortedTransactions = groupData?.transactions.sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });
  const transactionsGroupedByDate = sortedTransactions?.reduce(
    (acc, transaction) => {
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
    currency: string
  ) => {
    const sumInUsd = transactions.reduce((acc, transaction) => {
      const exchangeRate = convertCurrency(
        transaction.amount,
        transaction.currency,
        "USD"
      );
      return acc + exchangeRate;
    }, 0);

    const sumInCurrency = convertCurrency(sumInUsd, "USD", currency);

    return sumInCurrency;
  };

  const dateSums =
    transactionsGroupedByDate &&
    Object.entries(transactionsGroupedByDate).map(
      ([date, { transactions }]) => {
        const totalSum = countTotalSumInCurrency(transactions, "EUR");
        // fixed 2 decimal places
        const totalSumFormatted = totalSum.toFixed(2);

        return { date, totalSum: totalSumFormatted };
      }
    );

  return (
    <GroupLayout groupId={groupId!} groupName={groupData?.name ?? ""}>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">{`Transactions (${groupData?.transactions.length})`}</h2>
        {transactionsGroupedByDate &&
          Object.entries(transactionsGroupedByDate).map(
            ([date, { transactions, totalSum }]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-2">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  <p className="text-sm text-gray-500">
                    Total spent:{" "}
                    {
                      dateSums?.find((dateSum) => dateSum.date === date)
                        ?.totalSum
                    }{" "}
                    EUR
                  </p>
                </h3>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border-primary-text p-2 mb-2 rounded transition-colors duration-200 cursor-pointer flex items-center"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                      style={{
                        backgroundColor: getUserColor(transaction.userId),
                      }}
                    ></div>
                    <div className="flex justify-between items-center flex-grow">
                      <p className="font-normal">
                        {transaction.message.length > 15
                          ? `${transaction.message.slice(0, 15)}...`
                          : transaction.message}
                      </p>
                      <div className="text-sm text-white flex justify-between items-center">
                        <p className="font-bold text-xl pr-4">
                          {transaction.amount} {transaction.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
      </div>

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
          onClose={() => setSelectedTransaction(null)}
          onDelete={handleDeleteTransaction}
        />
      )}
    </GroupLayout>
  );
};

export default TransactionList;

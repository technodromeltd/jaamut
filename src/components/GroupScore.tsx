import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getGroup, GroupData } from "../utils/storage";
import GroupLayout from "./GroupLayout";
import {
  convertCurrency,
  getSupportedCurrencies,
} from "../utils/currencyConversion";

const GroupScore: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const supportedCurrencies = getSupportedCurrencies();

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery<GroupData | null>(["group", groupId], () => getGroup(groupId!));

  if (isLoading) return <div>Loading...</div>;
  if (error || !groupData) return <div>Error loading group data</div>;

  const calculateBalances = () => {
    const balances: { [userId: string]: number } = {};
    groupData.users.forEach((user) => (balances[user.id] = 0));

    groupData.transactions.forEach((transaction) => {
      const convertedAmount = convertCurrency(
        transaction.amount,
        transaction.currency,
        selectedCurrency
      );
      balances[transaction.userId] += convertedAmount;
    });

    return balances;
  };

  const calculateSettlements = (balances: { [userId: string]: number }) => {
    const totalSpent = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0
    );
    const averageSpent = totalSpent / groupData.users.length;
    const settlements: { from: string; to: string; amount: number }[] = [];

    const debtors = groupData.users.filter(
      (user) => balances[user.id] < averageSpent
    );
    const creditors = groupData.users.filter(
      (user) => balances[user.id] > averageSpent
    );

    debtors.forEach((debtor) => {
      let debtAmount = averageSpent - balances[debtor.id];
      creditors.forEach((creditor) => {
        if (debtAmount > 0) {
          const creditAmount = balances[creditor.id] - averageSpent;
          const settlementAmount = Math.min(debtAmount, creditAmount);
          if (settlementAmount > 0) {
            settlements.push({
              from: debtor.name,
              to: creditor.name,
              amount: Number(settlementAmount.toFixed(2)),
            });
            debtAmount -= settlementAmount;
          }
        }
      });
    });

    return settlements;
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements(balances);

  const totalSpent = Object.values(balances)
    .reduce((sum, balance) => sum + balance, 0)
    .toFixed(2);

  return (
    <GroupLayout groupId={groupId!} groupName={groupData.name}>
      <h2 className="text-2xl font-bold mb-4">Score</h2>
      <div className="mb-4">
        <label htmlFor="currency-select" className="mr-2">
          Select Currency:
        </label>
        <select
          id="currency-select"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="p-2 border rounded"
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold pb-2">
          Total Spent: {selectedCurrency} {totalSpent}
        </h3>
        {groupData.users.map((user) => (
          <p
            key={user.id}
            className="mb-4 p-2 bg-gray-100 rounded text-primary-button"
          >
            <span className="font-medium">{user.name}:</span> {selectedCurrency}{" "}
            {balances[user.id].toFixed(2)}
          </p>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Settlements</h3>
        {settlements.map((settlement, index) => (
          <p
            key={index}
            className="mb-4 p-2 bg-gray-100 rounded text-primary-button"
          >
            <span className="font-medium">{settlement.from}</span> pays{" "}
            <span className="font-medium">{settlement.to}</span>:{" "}
            <span className="font-bold">
              {selectedCurrency} {settlement.amount.toFixed(2)}
            </span>
          </p>
        ))}
      </div>
    </GroupLayout>
  );
};

export default GroupScore;

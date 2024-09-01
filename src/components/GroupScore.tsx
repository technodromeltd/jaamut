import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getGroup, GroupData } from "../utils/storage";
import GroupLayout from "./GroupLayout";
import { convertCurrency } from "../utils/currencyConversion";
import Loading from "./Loading";
import GroupNotFound from "./GroupNotFound";
import { settings } from "../settings/settings";
import CurrencySelector from "./CurrencySelector";

const GroupScore: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedCurrency, setSelectedCurrency] = useState(
    settings.defaultCurrency
  );

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery<GroupData | null>(["group", groupId], () => getGroup(groupId!));

  if (isLoading) return <Loading />;
  if (error || !groupData) return <GroupNotFound />;

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
      <h1>Score</h1>
      <p className="mb-4">
        Calculates the total amount spent by each user and shows the settlements
        needed to balance the group.
      </p>
      <div className="mb-4">
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold pb-2">
          Total Spent: {selectedCurrency} {totalSpent}
        </h3>
        {groupData.users.map((user, index) => {
          const userColor =
            settings.userColors[index % settings.userColors.length];
          return (
            <p
              key={user.id}
              className="mb-4 p-2 bg-gray-100 rounded text-secondary-text flex items-center"
            >
              <div
                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                style={{ backgroundColor: userColor }}
              ></div>
              <span className="font-medium">{user.name}:</span>{" "}
              {selectedCurrency} {balances[user.id].toFixed(2)}
            </p>
          );
        })}
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Settlements</h3>
        {settlements.map((settlement, index) => (
          <p
            key={index}
            className="mb-4 p-2 bg-gray-100 rounded text-secondary-text"
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

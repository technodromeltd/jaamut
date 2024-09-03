import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getGroup, GroupData } from "../../utils/storage";
import { convertCurrency, Currency } from "../../utils/currencyConversion";
import Loading from "../../components/Loading";
import GroupNotFound from "../../components/GroupNotFound";
import { settings } from "../../settings/settings";

const GroupScore: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("EUR");

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery<GroupData | null>(["group", groupId], () => getGroup(groupId!), {
    onSuccess: (data) => {
      if (data) {
        setSelectedCurrency(data.defaultCurrency);
      }
    },
  });

  // Update selectedCurrency when groupData changes
  useEffect(() => {
    if (groupData && groupData.defaultCurrency) {
      setSelectedCurrency(groupData.defaultCurrency);
    }
  }, [groupData]);

  if (isLoading) return <Loading />;
  if (error || !groupData) return <GroupNotFound />;

  const calculateBalances = () => {
    const balances: { [userId: string]: number } = {};
    groupData.users.forEach((user) => (balances[user.id] = 0));

    groupData.transactions.forEach((transaction) => {
      const convertedAmount = convertCurrency(
        transaction.amount,
        transaction.currency,
        selectedCurrency as Currency
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
    <>
      <h1>Score</h1>
      <p className="mb-4">
        Calculates the total amount spent by each user and shows the settlements
        needed to balance the group.
      </p>
      <div className="mb-4"></div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold pb-2">
          Total Spent: {selectedCurrency} {totalSpent}
        </h2>
        {groupData.users.map((user, index) => {
          const userColor =
            settings.userColors[index % settings.userColors.length];
          return (
            <div
              key={user.id}
              className="mb-4  rounded text-secondary-text flex items-center"
            >
              <div className="flex  justify-between  items-center p-2 bg-secondary-button rounded w-full">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: userColor }}
                  ></div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <span className="font-medium">
                  {selectedCurrency} {balances[user.id].toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Settlements</h2>
        {settlements.map((settlement, index) => (
          <div key={index} className="mb-4 p-2 rounded text-secondary-text">
            <span className="font-medium">{settlement.from}</span> pays{" "}
            <span className="font-medium">{settlement.to}</span>:{" "}
            <span className="font-bold">
              {selectedCurrency} {settlement.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default GroupScore;

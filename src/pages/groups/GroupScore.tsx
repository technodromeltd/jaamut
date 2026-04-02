import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getGroup, GroupData, Category } from "../../utils/storage";
import { convertCurrency, Currency } from "../../utils/currencyConversion";
import Loading from "../../components/Loading";
import GroupNotFound from "../../components/GroupNotFound";
import { settings } from "../../settings/settings";
import { calculateSettlementSummary } from "../../utils/settlements";

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

  const settlementSummary = calculateSettlementSummary({
    users: groupData.users,
    transactions: groupData.transactions,
    currency: selectedCurrency as Currency,
  });
  const balances = settlementSummary.balances;
  const settlements = settlementSummary.settlements;
  const totalSpent = settlementSummary.totalPaid.toFixed(2);

  // Calculate spending by category
  const calculateCategorySpending = () => {
    const categoryTotals: { [key in Category]: number } = {
      [Category.FOOD]: 0,
      [Category.TRANSPORTATION]: 0,
      [Category.ENTERTAINMENT]: 0,
      [Category.SHOPPING]: 0,
      [Category.ACCOMMODATION]: 0,
      [Category.OTHER]: 0,
    };

    groupData.transactions.forEach((transaction) => {
      const convertedAmount = convertCurrency(
        transaction.amount,
        transaction.currency,
        selectedCurrency as Currency
      );
      categoryTotals[transaction.category] += convertedAmount;
    });

    return Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category as Category,
        amount,
        percentage: (amount / parseFloat(totalSpent)) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categorySpending = calculateCategorySpending();

  // Pie chart colors
  const pieColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
  ];

  return (
    <>
      <h1>Score</h1>
      <p className="mb-4">
        Shows the total amount paid by each user and calculates settlements
        needed to balance the group.
      </p>
      <div className="mb-4"></div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold pb-2">
          Total Group Spending: {selectedCurrency} {totalSpent}
        </h2>

        {/* Category Spending Section */}
        {categorySpending.length > 0 && (
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Spending by Category</h3>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Pie Chart */}
              <div className="flex-1">
                <svg width="200" height="200" className="mx-auto">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  {categorySpending.map((item, index) => {
                    const startAngle =
                      categorySpending
                        .slice(0, index)
                        .reduce((sum, cat) => sum + cat.percentage, 0) * 3.6;
                    const endAngle = startAngle + item.percentage * 3.6;
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);

                    const x1 = 100 + 80 * Math.cos(startRad);
                    const y1 = 100 + 80 * Math.sin(startRad);
                    const x2 = 100 + 80 * Math.cos(endRad);
                    const y2 = 100 + 80 * Math.sin(endRad);

                    const largeArcFlag = item.percentage > 50 ? 1 : 0;

                    return (
                      <path
                        key={item.category}
                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={pieColors[index % pieColors.length]}
                        stroke="#333"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Category Legend */}
              <div className="flex-1">
                <div className="space-y-2">
                  {categorySpending.map((item, index) => (
                    <div
                      key={item.category}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: pieColors[index % pieColors.length],
                        }}
                      />
                      <span className="text-sm">
                        {item.category}: {selectedCurrency}{" "}
                        {item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
                  Paid: {selectedCurrency} {balances[user.id].paid.toFixed(2)}
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

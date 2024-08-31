import React, { useState } from "react";
import { Transaction, User } from "../utils/storage";
import {
  convertCurrency,
  getSupportedCurrencies,
} from "../utils/currencyConversion";

interface GroupStatusProps {
  transactions: Transaction[];
  users: User[];
}

const GroupStatus: React.FC<GroupStatusProps> = ({ transactions, users }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const supportedCurrencies = getSupportedCurrencies();

  const calculateBalances = () => {
    const balances: { [userId: string]: number } = {};
    users.forEach((user) => (balances[user.id] = 0));

    transactions.forEach((transaction) => {
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
    const averageSpent = totalSpent / users.length;
    const settlements: { from: string; to: string; amount: number }[] = [];

    const debtors = users.filter((user) => balances[user.id] < averageSpent);
    const creditors = users.filter((user) => balances[user.id] > averageSpent);

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

  const totalSpent = Object.values(balances).reduce(
    (sum, balance) => sum + balance,
    0
  );

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Group Status</h3>
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
        <h4 className="text-lg font-semibold">
          Total Spent {totalSpent} {selectedCurrency}
        </h4>
        {users.map((user) => (
          <p key={user.id}>
            {user.name}: {selectedCurrency} {balances[user.id].toFixed(2)}
          </p>
        ))}
      </div>
      <div>
        <h4 className="text-lg font-semibold">Settlements</h4>
        {settlements.map((settlement, index) => (
          <p key={index}>
            {settlement.from} pays {settlement.to}: {selectedCurrency}{" "}
            {settlement.amount}
          </p>
        ))}
      </div>
    </div>
  );
};

export default GroupStatus;

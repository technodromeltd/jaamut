import React, { useState } from "react";
import { Transaction, User } from "../utils/storage";
import {
  Currency,
  getSupportedCurrencies,
} from "../utils/currencyConversion";
import { calculateSettlementSummary } from "../utils/settlements";

interface GroupStatusProps {
  transactions: Transaction[];
  users: User[];
}

const GroupStatus: React.FC<GroupStatusProps> = ({ transactions, users }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("EUR");
  const supportedCurrencies = getSupportedCurrencies();
  const settlementSummary = calculateSettlementSummary({
    users,
    transactions,
    currency: selectedCurrency,
  });
  const balances = settlementSummary.balances;
  const settlements = settlementSummary.settlements;
  const totalSpent = settlementSummary.totalPaid;

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
          onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
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
            {user.name}: {selectedCurrency} {balances[user.id].paid.toFixed(2)}
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

import React, { useState } from "react";
import CurrencySelector from "./CurrencySelector";
import { User } from "../utils/storage";
import { settings } from "../settings/settings";

interface TransactionInputProps {
  onAddTransaction: (
    amount: number,
    currency: string,
    message: string,
    userId: string
  ) => void;
  users: User[];
}

const TransactionInput: React.FC<TransactionInputProps> = ({
  onAddTransaction,
  users,
}) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && currency && userId) {
      onAddTransaction(parseFloat(amount), currency, message, userId);
      setAmount("");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="p-2 border rounded w-full"
          required
        />
      </div>
      <div>
        <CurrencySelector
          selectedCurrency={currency}
          onCurrencyChange={setCurrency}
        />
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (optional)"
          className="p-2 border rounded w-full"
        />
      </div>
      <div>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="p-2 border rounded w-full"
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-primary-button text-white p-2 rounded w-full hover:bg-[#626B61]"
      >
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionInput;

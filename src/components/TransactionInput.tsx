import React, { useState } from "react";
import CurrencySelector from "./CurrencySelector";
import { User } from "../utils/storage";
import { settings } from "../settings/settings";
import Toast from "./Toast";
import { Link } from "react-router-dom";
import Button from "./Button";

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
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && currency && userId) {
      onAddTransaction(parseFloat(amount), currency, message, userId);
      setAmount("");
      setMessage("");
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <div className="flex flex-col justify-center items-center align-middle gap-5">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="p-2 border rounded  border-none w-fit text-center text-6xl focus:outline-none"
            required
          />
          <CurrencySelector
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What is this for?"
            className="p-2 border rounded w-full"
          />
          <div className="flex flex-wrap gap-2">
            {users.map((user, index) => {
              const userColor =
                settings.userColors[index % settings.userColors.length];
              console.log(userColor);
              return (
                <label key={user.id} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="user"
                    value={user.id}
                    checked={userId === user.id}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                  <span className="ml-2" style={{ color: userColor }}>
                    {user.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <Button isSubmit variant="primary" fullWidth>
          Add Transaction
        </Button>
      </form>
      {showToast && (
        <Toast
          message="Transaction added successfully!"
          type="info"
          onClose={handleCloseToast}
          duration={3000}
        />
      )}
    </>
  );
};

export default TransactionInput;

import React, { useState, useEffect } from "react";
import CurrencySelector from "./CurrencySelector";
import { Category, Transaction, User } from "../utils/storage";
import { settings } from "../settings/settings";
import Toast from "./Toast";
import Button from "./Button";
import { convertCurrency, Currency } from "../utils/currencyConversion";
import MultiSelect from "./MultiSelect";

interface TransactionEditProps {
  transaction: Transaction;
  users: User[];
  onSave: (updatedTransaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionEdit: React.FC<TransactionEditProps> = ({
  transaction,
  users,
  onSave,
  onCancel,
}) => {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({
    ...transaction,
  });

  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [amountInDefaultCurrency, setAmountInDefaultCurrency] = useState<
    number | null
  >(null);

  useEffect(() => {
    updateAmountInDefaultCurrency(
      editedTransaction.amount,
      editedTransaction.currency
    );
  }, [editedTransaction.amount, editedTransaction.currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      editedTransaction.amount &&
      editedTransaction.currency &&
      editedTransaction.userId &&
      editedTransaction.participants.length > 0
    ) {
      onSave(editedTransaction);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } else {
      setErrorMessage(
        "Please fill in all fields and select at least one participant"
      );
    }
  };

  const updateAmountInDefaultCurrency = (
    amount: number,
    currency: Currency
  ) => {
    if (currency !== settings.defaultCurrency) {
      const amountInDefaultCurrency = convertCurrency(
        amount,
        currency,
        settings.defaultCurrency
      );
      return setAmountInDefaultCurrency(amountInDefaultCurrency);
    }
    return setAmountInDefaultCurrency(null);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setEditedTransaction({ ...editedTransaction, currency });
    updateAmountInDefaultCurrency(editedTransaction.amount, currency);
  };

  const handleAmountChange = (amount: number) => {
    setEditedTransaction({ ...editedTransaction, amount });
    updateAmountInDefaultCurrency(amount, editedTransaction.currency);
  };

  const handleParticipantsChange = (participantIds: string[]) => {
    setEditedTransaction({
      ...editedTransaction,
      participants: participantIds,
    });
  };

  const handleDateTimeChange = (datetime: string) => {
    setEditedTransaction({ ...editedTransaction, datetime });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>
        {`
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
          input[type="datetime-local"]::-webkit-datetime-edit {
            color: inherit;
          }
        `}
      </style>
      <div className="bg-primary-bg text-primary-text p-6 rounded-lg shadow-lg max-w-md w-full m-4 max-h-[90vh] overflow-y-auto relative">
        <h1 className="text-xl font-bold mb-4">Edit Transaction</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <CurrencySelector
              selectedCurrency={editedTransaction.currency}
              onCurrencyChange={handleCurrencyChange}
              className="border-none text-2xl appearance-none mb-0 pb-0 focus:outline-none rounded-b-none rounded-t-md"
            />
            <input
              type="number"
              value={Number(editedTransaction.amount).toString()}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              className="p-0 border-none text-4xl focus:outline-none w-fit text-center"
              required
            />
            {amountInDefaultCurrency && (
              <span className="text-sm pt-1">
                {amountInDefaultCurrency.toFixed(2)} {settings.defaultCurrency}
              </span>
            )}
          </div>

          <input
            type="text"
            value={editedTransaction.message}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                message: e.target.value,
              })
            }
            placeholder="Expense title"
            className="p-2 border rounded w-full"
            required
          />

          <textarea
            value={editedTransaction.details}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                details: e.target.value,
              })
            }
            placeholder="Transaction details"
            className="p-2 border rounded w-full h-20 resize-none bg-primary-bg text-primary-text"
          />

          <select
            value={editedTransaction.category}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                category: e.target.value as Category,
              })
            }
            className="p-2 border rounded w-full"
          >
            {Object.values(Category).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={editedTransaction.userId}
            onChange={(e) =>
              setEditedTransaction({
                ...editedTransaction,
                userId: e.target.value,
              })
            }
            className="p-2 border rounded w-full"
            required
          >
            <option value="" disabled>
              Select user
            </option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <MultiSelect
            users={users}
            selectedUserIds={editedTransaction.participants}
            onSelectionChange={handleParticipantsChange}
            placeholder="Select participants"
            className="w-full bg-transparent"
          />

          <input
            type="datetime-local"
            value={editedTransaction.datetime.slice(0, 16)}
            onChange={(e) => handleDateTimeChange(e.target.value + ":00.000Z")}
            className="p-2 border rounded w-full bg-primary-bg text-primary-text"
            required
          />

          <div className="flex justify-between space-x-2 w-full pt-4">
            <Button variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button isSubmit variant="primary" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>

        {errorMessage && (
          <Toast
            message={errorMessage}
            type="error"
            onClose={() => setErrorMessage(null)}
            duration={3000}
          />
        )}

        {showToast && (
          <Toast
            message="Transaction updated successfully!"
            type="info"
            onClose={() => setShowToast(false)}
            duration={3000}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionEdit;

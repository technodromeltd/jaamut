import React, { useState, useEffect, useRef } from "react";
import CurrencySelector from "./CurrencySelector";
import { Category, TransactionToSave, User } from "../utils/storage";
import { settings } from "../settings/settings";
import Toast from "./Toast";
import Button from "./Button";
import { FaCamera, FaFileImage } from "react-icons/fa";
import Loading from "./Loading";
import { convertCurrency, Currency } from "../utils/currencyConversion";

interface TransactionInputProps {
  onAddTransaction: (transaction: TransactionToSave) => void;
  users: User[];
}

const TransactionInput: React.FC<TransactionInputProps> = ({
  onAddTransaction,
  users,
}) => {
  const [transaction, setTransaction] = useState<TransactionToSave>({
    amount: 0,
    currency: "KRW",
    details: "",
    category: Category.OTHER,
    userId: "",
    datetime: "",
    message: "",
  });

  const [showToast, setShowToast] = useState(false);

  // Add new state for file input and loading state
  const [isLoading, setIsLoading] = useState(false);
  const [amountInDefaultCurrency, setAmountInDefaultCurrency] = useState<
    number | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("lastSelectedUserId");
    if (savedUserId) {
      setTransaction({ ...transaction, userId: savedUserId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction.amount && transaction.currency && transaction.userId) {
      const transactionToSave = {
        ...transaction,
        datetime: new Date().toISOString(),
      };
      onAddTransaction(transactionToSave);
      setTransaction({
        ...transaction,
        amount: 0,
        currency: "KRW",
        details: "",
        category: Category.OTHER,
        userId: "",
        datetime: "",
        message: "",
      });
      setShowToast(true);
      localStorage.setItem("lastSelectedUserId", transaction.userId);
    } else {
      setErrorMessage("Please fill in all fields");
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Add new function to handle file upload and API call
  const handleFileUpload = async (file: File) => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("/idgaf/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TransactionToSave = await response.json();

      // Update state with received data
      setTransaction({
        ...transaction,
        amount: data.amount,
        currency: data.currency,
        details: data.details,
        category: data.category,
        datetime: data.datetime,
        message: data.message,
      });

      setShowToast(true);
    } catch (error) {
      console.error("Error processing image:", error);
      setErrorMessage("Failed to process image. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    } else {
      console.log("No file selected");
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
    setTransaction({ ...transaction, currency });
    updateAmountInDefaultCurrency(transaction.amount, currency);
  };

  const handleAmountChange = (amount: number) => {
    setTransaction({ ...transaction, amount });
    updateAmountInDefaultCurrency(amount, transaction.currency);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="">
        <div className="flex  w-full flex-col justify-center items-center align-middle gap-6 py-8">
          <div className="flex flex-1 flex-col justify-center items-center align-middle gap-0 w-full">
            <CurrencySelector
              selectedCurrency={transaction.currency}
              onCurrencyChange={handleCurrencyChange}
              className="border-none text-2xl appearance-none mb-0 pb-0 focus:outline-none rounded-b-none rounded-t-md"
            />
            <input
              type="number"
              value={Number(transaction.amount).toString()}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01" // Allow decimal values
              className="p-0 border-none text-6xl focus:outline-none w-fit text-center m-"
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
            value={transaction.message}
            onChange={(e) =>
              setTransaction({ ...transaction, message: e.target.value })
            }
            placeholder="Expense title"
            className="p-2 border rounded w-full"
          />
          <select
            value={transaction.category}
            onChange={(e) =>
              setTransaction({
                ...transaction,
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
            value={transaction.userId}
            onChange={(e) =>
              setTransaction({ ...transaction, userId: e.target.value })
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
          <div className="flex gap-2 w-full">
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <span>Processing receipt...</span>
                <Loading />
              </div>
            ) : (
              <>
                <label className="bg-slate-600rounded flex-1 flex justify-center items-center cursor-pointer p-2 text-white">
                  <FaCamera className="mr-2" />
                  {isLoading ? "Loading..." : "Scan receipt"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                    capture="environment"
                  />
                </label>
                <label className="border-white border-1 rounded flex-1 flex justify-center items-center cursor-pointer p-2 text-white">
                  <FaFileImage className="mr-2" />
                  {isLoading ? "Loading..." : "Choose image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>
              </>
            )}
          </div>
        </div>
        <Button isSubmit variant="primary" fullWidth>
          Save Transaction
        </Button>
      </form>
      <span>{errorMessage}</span>
      <span className="text-xs text-center w-full">
        Swipe left or right to change pages
      </span>
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
          message="Transaction added successfully!"
          type="info"
          onClose={handleCloseToast}
          duration={3000}
        />
      )}
    </div>
  );
};

export default TransactionInput;

import React from "react";
import { Transaction, User } from "../utils/storage";
import Button from "./Button";

interface TransactionDetailsProps {
  transaction: Transaction;
  user: User | undefined;
  onClose: () => void;
  onDelete: (id: number) => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  user,
  onClose,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-bg text-primary-text p-6 rounded-lg shadow-lg max-w-md w-full m-4">
        <h1 className="text-xl font-bold mb-4">Transaction Details</h1>
        <p>
          <span className="font-semibold">Amount:</span> {transaction.amount}{" "}
          {transaction.currency}
        </p>
        <p>
          <span className="font-semibold">Message:</span> {transaction.message}
        </p>
        <p>
          <span className="font-semibold">By:</span> {user?.name || "Unknown"}
        </p>
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {new Date(transaction.datetime).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Category:</span>{" "}
          {transaction.category}
        </p>
        <span className="font-semibold">Details:</span>
        <p className="text-sm mb-4">{transaction.details}</p>
        <div className="flex justify-between space-x-2 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onDelete(transaction.id)}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;

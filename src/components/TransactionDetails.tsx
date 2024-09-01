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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p">
      <div className="bg-primary-bg text-primary-text p-6 rounded-lg shadow-lg max-w-md w-full m-4">
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        <p className="mb-2">
          <span className="font-semibold">Amount:</span> {transaction.amount}{" "}
          {transaction.currency}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Message:</span> {transaction.message}
        </p>
        <p className="mb-2">
          <span className="font-semibold">By:</span> {user?.name || "Unknown"}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Date:</span>{" "}
          {new Date(transaction.datetime).toLocaleString()}
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onDelete(transaction.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;

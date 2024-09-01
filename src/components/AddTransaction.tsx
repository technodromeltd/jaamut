import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GroupLayout from "./GroupLayout";
import Button from "./Button";
import { User } from "../utils/storage";

interface AddTransactionProps {
  users: User[];
  groupName: string;
  onAddTransaction: (transaction: any) => void; // Replace 'any' with your transaction type
}

const AddTransaction: React.FC<AddTransactionProps> = ({
  users,
  groupName,
  onAddTransaction,
}) => {
  const { groupId } = useParams<{ groupId: string }>();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount && paidBy) {
      const transaction = {
        id: Date.now().toString(),
        description,
        amount: parseFloat(amount),
        paidBy,
        date: new Date().toISOString(),
      };
      onAddTransaction(transaction);
      // Reset form
      setDescription("");
      setAmount("");
      setPaidBy("");
    }
  };

  return (
    <GroupLayout groupId={groupId!} groupName={groupName}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="paidBy" className="block mb-1">
              Paid By
            </label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Add Transaction
          </Button>
        </form>
      </div>
    </GroupLayout>
  );
};

export default AddTransaction;

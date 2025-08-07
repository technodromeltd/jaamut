import React, { useState } from "react";
import Button from "./Button";
import Toast from "./Toast";

interface MigrationToolProps {
  groupId?: string;
}

const MigrationTool: React.FC<MigrationToolProps> = ({ groupId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [defaultToAllUsers, setDefaultToAllUsers] = useState(true);

  const handleMigration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: { defaultToAllUsers: boolean; groupId?: string } = {
        defaultToAllUsers,
      };

      if (groupId) {
        payload.groupId = groupId;
      }

      const response = await fetch("/api/migrate-participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white text-primary-bg">
      <h2 className="text-lg font-semibold mb-4">Participant Migration Tool</h2>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={defaultToAllUsers}
            onChange={(e) => setDefaultToAllUsers(e.target.checked)}
            className="mr-2"
          />
          Default to all users (uncheck to default to transaction owner)
        </label>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {groupId
            ? `Will migrate group: ${groupId}`
            : "Will migrate ALL groups"}
        </p>
      </div>

      <Button
        onClick={handleMigration}
        disabled={isLoading}
        variant="primary"
        className="w-full"
      >
        {isLoading ? "Migrating..." : "Run Migration"}
      </Button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MigrationTool;

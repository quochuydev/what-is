"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface NewKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  fullKey: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<NewKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed to fetch keys");
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleAddKey = async () => {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create key");

      const data = await res.json();
      setNewlyCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } catch {
      setError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete key");
      fetchKeys();
    } catch {
      setError("Failed to delete API key");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Add Key
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Keys Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead className="bg-accent">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Last Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              keys.map((apiKey) => (
                <tr key={apiKey.id}>
                  <td className="px-4 py-3 text-sm">{apiKey.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                    {apiKey.keyPrefix}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : "Never"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(apiKey.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Key Modal */}
      {showAddModal && !newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6">
            <h2 className="mb-4 text-xl font-bold">Create API Key</h2>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name..."
              className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-foreground"
              disabled={creating}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKeyName("");
                }}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:bg-accent"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleAddKey}
                disabled={creating || !newKeyName.trim()}
                className="flex-1 rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Key Created Modal */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6">
            <h2 className="mb-2 text-xl font-bold">API Key Created</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Copy your API key now. You won&apos;t be able to see it again.
            </p>
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent p-3">
              <code className="flex-1 break-all font-mono text-sm">
                {newlyCreatedKey.fullKey}
              </code>
              <button
                onClick={() => copyToClipboard(newlyCreatedKey.fullKey)}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-background"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => {
                setNewlyCreatedKey(null);
                setShowAddModal(false);
              }}
              className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

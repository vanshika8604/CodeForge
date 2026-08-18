"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface RunPanelProps {
  roomId: string;
}

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
}

export function RunPanel({ roomId }: RunPanelProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.rooms.execute(roomId);
      setResult(res.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border rounded p-3">
      <button
        onClick={handleRun}
        disabled={running}
        className="bg-green-700 text-white rounded px-4 py-2 text-sm disabled:opacity-50 self-start"
      >
        {running ? "Running..." : "▶ Run"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="bg-black rounded p-3 font-mono text-sm text-gray-200 max-h-48 overflow-y-auto">
          <p className="text-gray-500 mb-1">{result.status}</p>
          {result.compileOutput && (
            <pre className="text-yellow-400 whitespace-pre-wrap">{result.compileOutput}</pre>
          )}
          {result.stdout && <pre className="whitespace-pre-wrap">{result.stdout}</pre>}
          {result.stderr && (
            <pre className="text-red-400 whitespace-pre-wrap">{result.stderr}</pre>
          )}
          {!result.stdout && !result.stderr && !result.compileOutput && (
            <p className="text-gray-500">No output</p>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  const hasError =
    result?.stderr != null || result?.compileOutput != null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#232b3d] bg-[#111722] p-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-gray-200">
            Code Execution
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Run the current code
          </p>
        </div>

        <Button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="text-xs px-3 py-1.5"
        >
          {running ? "Running..." : "▶ Run"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-[#0a0e14] border border-[#1a2232] rounded-lg p-3 font-mono text-xs max-h-40 overflow-y-auto">
          <Badge tone={hasError ? "danger" : "success"}>
            {result.status}
          </Badge>

          {result.compileOutput && (
            <pre className="text-yellow-400 mt-2 whitespace-pre-wrap">
              {result.compileOutput}
            </pre>
          )}

          {result.stdout && (
            <pre className="text-gray-300 mt-2 whitespace-pre-wrap">
              {result.stdout}
            </pre>
          )}

          {result.stderr && (
            <pre className="text-red-400 mt-2 whitespace-pre-wrap">
              {result.stderr}
            </pre>
          )}

          {!result.stdout &&
            !result.stderr &&
            !result.compileOutput && (
              <p className="text-gray-500 mt-2">No output</p>
            )}
        </div>
      )}
    </div>
  );
}
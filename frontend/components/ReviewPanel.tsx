"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface CodeIssue {
  severity: "info" | "warning" | "critical";
  line: number | null;
  message: string;
}

interface ReviewResult {
  summary: string;
  issues: CodeIssue[];
}

const SEVERITY_STYLES: Record<CodeIssue["severity"], string> = {
  info: "text-blue-400 border-blue-800",
  warning: "text-yellow-400 border-yellow-800",
  critical: "text-red-400 border-red-800",
};

interface ReviewPanelProps {
  roomId: string;
}

export function ReviewPanel({ roomId }: ReviewPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReview() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.rooms.review(roomId);
      setResult(res.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border rounded p-3">
      <button
        onClick={handleReview}
        disabled={loading}
        className="bg-purple-700 text-white rounded px-4 py-2 text-sm disabled:opacity-50 self-start"
      >
        {loading ? "Reviewing..." : "✦ AI Review"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          <p className="text-sm text-gray-300">{result.summary}</p>
          {result.issues.length === 0 ? (
            <p className="text-sm text-gray-500">No issues found.</p>
          ) : (
            result.issues.map((issue, i) => (
              <div
                key={i}
                className={`text-xs border-l-2 pl-2 ${SEVERITY_STYLES[issue.severity]}`}
              >
                {issue.line !== null && <span className="mr-1">Line {issue.line}:</span>}
                {issue.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  info: "border-blue-500",
  warning: "border-yellow-500",
  critical: "border-red-500",
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
    <div className="flex flex-col gap-3 rounded-xl border border-[#232b3d] bg-[#111722] p-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-gray-200">
            AI Code Review
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Analyze the current code
          </p>
        </div>

        <Button
          type="button"
          onClick={handleReview}
          disabled={loading}
          className="text-xs px-3 py-1.5"
        >
          {loading ? "Reviewing..." : "✦ AI Review"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
          <div className="rounded-lg bg-[#0a0e14] border border-[#1a2232] p-3">
            <p className="text-xs text-gray-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {result.issues.length === 0 ? (
            <div className="rounded-lg border border-green-900/50 bg-green-900/10 px-3 py-2">
              <p className="text-xs text-green-400">
                No issues found.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {result.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`text-xs border-l-2 pl-2 py-1 ${SEVERITY_STYLES[issue.severity]}`}
                >
                  <Badge
                    tone={
                      issue.severity === "critical"
                        ? "danger"
                        : issue.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {issue.severity}
                  </Badge>

                  <span className="ml-2 text-gray-300">
                    {issue.line !== null
                      ? `L${issue.line}: `
                      : ""}
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
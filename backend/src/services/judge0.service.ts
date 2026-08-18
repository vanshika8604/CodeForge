import axios from "axios";
import { env } from "../config/env";
import { getLanguageId } from "../utils/languageMap";

const client = axios.create({
  baseURL: env.judge0ApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
}

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 10;

export async function executeCode(language: string, sourceCode: string, stdin = ""): Promise<ExecutionResult> {
  const languageId = getLanguageId(language);

  const submitResponse = await client.post("/submissions", {
    source_code: Buffer.from(sourceCode).toString("base64"),
    language_id: languageId,
    stdin: Buffer.from(stdin).toString("base64"),
  }, {
    params: { base64_encoded: "true" },
  });

  const { token } = submitResponse.data;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const resultResponse = await client.get(`/submissions/${token}`, {
      params: { base64_encoded: "true" },
    });

    const data = resultResponse.data;
    const statusId = data.status?.id;

    // status id 1 = "In Queue", 2 = "Processing" — keep polling.
    if (statusId === 1 || statusId === 2) {
      continue;
    }

    return {
      stdout: decodeBase64(data.stdout),
      stderr: decodeBase64(data.stderr),
      compileOutput: decodeBase64(data.compile_output),
      status: data.status?.description ?? "Unknown",
    };
  }

  throw new Error("EXECUTION_TIMEOUT");
}

function decodeBase64(value: string | null): string | null {
  if (!value) return null;
  return Buffer.from(value, "base64").toString("utf-8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
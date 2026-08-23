process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.GEMINI_MODEL = "gemini-3.6-flash";

const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: (...args: any[]) => mockGenerateContent(...args),
    },
  })),
}));

import { reviewCode } from "./openai.service";

describe("openai.service", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it("returns an empty-code message without calling the API when code is blank", async () => {
    const result = await reviewCode("javascript", "   ");

    expect(result.summary).toMatch(/no code/i);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("parses a well-formed AI JSON response", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "Looks mostly fine.",
        issues: [
          {
            severity: "warning",
            line: 3,
            message: "Unused variable",
          },
        ],
      }),
    });

    const result = await reviewCode("javascript", "let x = 1;");

    expect(result.summary).toBe("Looks mostly fine.");
    expect(result.issues).toHaveLength(1);
  });

  it("throws INVALID_AI_RESPONSE for unparsable content", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "not valid json at all",
    });

    await expect(
      reviewCode("javascript", "let x = 1;")
    ).rejects.toThrow("INVALID_AI_RESPONSE");
  });

  it("defaults issues to an empty array if the AI omits it", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "Fine.",
      }),
    });

    const result = await reviewCode("javascript", "let x = 1;");

    expect(result.issues).toEqual([]);
  });
});

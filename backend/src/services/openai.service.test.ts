process.env.OPENAI_API_KEY = "test-openai-key";

import { reviewCode } from "./openai.service";

const mockCreate = jest.fn();

jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (...args: any[]) => mockCreate(...args),
      },
    },
  })),
}));

describe("openai.service", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns an empty-code message without calling the API when code is blank", async () => {
    const result = await reviewCode("javascript", "   ");

    expect(result.summary).toMatch(/no code/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("parses a well-formed AI JSON response", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "Looks mostly fine.",
              issues: [
                {
                  severity: "warning",
                  line: 3,
                  message: "Unused variable",
                },
              ],
            }),
          },
        },
      ],
    });

    const result = await reviewCode("javascript", "let x = 1;");

    expect(result.summary).toBe("Looks mostly fine.");
    expect(result.issues).toHaveLength(1);
  });

  it("throws INVALID_AI_RESPONSE for unparsable content", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "not valid json at all",
          },
        },
      ],
    });

    await expect(
      reviewCode("javascript", "let x = 1;")
    ).rejects.toThrow("INVALID_AI_RESPONSE");
  });

  it("defaults issues to an empty array if the AI omits it", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "Fine.",
            }),
          },
        },
      ],
    });

    const result = await reviewCode("javascript", "let x = 1;");

    expect(result.issues).toEqual([]);
  });
});
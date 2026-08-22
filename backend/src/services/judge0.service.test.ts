import axios from "axios";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe("judge0.service", () => {
  let mockPost: jest.Mock;
  let mockGet: jest.Mock;
  let executeCode: typeof import("./judge0.service").executeCode;

  beforeEach(async () => {
    jest.resetModules();

    mockPost = jest.fn();
    mockGet = jest.fn();

    jest.doMock("axios", () => ({
      __esModule: true,
      default: {
        create: jest.fn(() => ({
          post: mockPost,
          get: mockGet,
        })),
      },
    }));

    const service = await import("./judge0.service");
    executeCode = service.executeCode;
  });

  it("submits code and returns decoded stdout once execution finishes", async () => {
    mockPost.mockResolvedValue({
      data: { token: "submission-abc" },
    });

    mockGet.mockResolvedValue({
      data: {
        status: { id: 3, description: "Accepted" },
        stdout: Buffer.from("hello from codeforge\n").toString("base64"),
        stderr: null,
        compile_output: null,
      },
    });

    const result = await executeCode(
      "javascript",
      "console.log('hello from codeforge')"
    );

    expect(result.stdout).toBe("hello from codeforge\n");
    expect(result.status).toBe("Accepted");
  });

  it("polls again while status is 'In Queue' or 'Processing', then returns the final result", async () => {
    mockPost.mockResolvedValue({
      data: { token: "submission-abc" },
    });

    mockGet
      .mockResolvedValueOnce({
        data: {
          status: { id: 1, description: "In Queue" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: { id: 2, description: "Processing" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: { id: 3, description: "Accepted" },
          stdout: Buffer.from("done").toString("base64"),
          stderr: null,
          compile_output: null,
        },
      });

    const result = await executeCode("python", "print('done')");

    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(result.stdout).toBe("done");
  }, 10000);

  it("throws UNSUPPORTED_LANGUAGE for a language not in the map", async () => {
    await expect(
      executeCode("cobol", "some code")
    ).rejects.toThrow("UNSUPPORTED_LANGUAGE");

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("throws EXECUTION_TIMEOUT if the submission never leaves 'Processing'", async () => {
    mockPost.mockResolvedValue({
      data: { token: "submission-abc" },
    });

    mockGet.mockResolvedValue({
      data: {
        status: {
          id: 2,
          description: "Processing",
        },
      },
    });

    await expect(
      executeCode("javascript", "while(true){}")
    ).rejects.toThrow("EXECUTION_TIMEOUT");
  }, 15000);
});
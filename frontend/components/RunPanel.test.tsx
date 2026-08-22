import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RunPanel } from "./RunPanel";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { rooms: { execute: jest.fn() } },
}));

describe("RunPanel", () => {
  it("shows stdout after a successful run", async () => {
    const user = userEvent.setup();
    (api.rooms.execute as jest.Mock).mockResolvedValue({
      result: { stdout: "hello world", stderr: null, compileOutput: null, status: "Accepted" },
    });

    render(<RunPanel roomId="room-1" />);

    await user.click(screen.getByRole("button", { name: /Run/ }));

    expect(await screen.findByText("hello world")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("shows an error message if execution fails", async () => {
    const user = userEvent.setup();
    (api.rooms.execute as jest.Mock).mockRejectedValue(new Error("Execution timed out"));

    render(<RunPanel roomId="room-1" />);

    await user.click(screen.getByRole("button", { name: /Run/ }));

    expect(await screen.findByText("Execution timed out")).toBeInTheDocument();
  });

  it("shows the running state while waiting for the API call to resolve", async () => {
    const user = userEvent.setup();
    let resolveExecute: (value: any) => void;
    (api.rooms.execute as jest.Mock).mockImplementation(
      () => new Promise((resolve) => { resolveExecute = resolve; })
    );

    render(<RunPanel roomId="room-1" />);

    await user.click(screen.getByRole("button", { name: /Run/ }));

    expect(screen.getByRole("button", { name: "Running..." })).toBeDisabled();

    resolveExecute!({ result: { stdout: "done", stderr: null, compileOutput: null, status: "Accepted" } });
    await waitFor(() => expect(screen.getByText("done")).toBeInTheDocument());
  });
});
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  it("renders only email and password fields in login mode", () => {
    render(<AuthForm mode="login" onSubmit={jest.fn()} />);

    expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("renders a name field in register mode", () => {
    render(<AuthForm mode="register" onSubmit={jest.fn()} />);

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("calls onSubmit with the entered values when submitted", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<AuthForm mode="login" onSubmit={handleSubmit} />);

    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: undefined,
      email: "ada@example.com",
      password: "secret123",
    });
  });

  it("shows an error message when onSubmit rejects", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockRejectedValue(new Error("Invalid email or password"));

    render(<AuthForm mode="login" onSubmit={handleSubmit} />);

    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("disables the submit button while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const handleSubmit = jest.fn(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve; })
    );

    render(<AuthForm mode="login" onSubmit={handleSubmit} />);

    await user.type(screen.getByPlaceholderText("Email"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByRole("button")).toBeDisabled();

    resolveSubmit!();

await waitFor(() =>
  expect(screen.getByRole("button", { name: "Log in" })).not.toBeDisabled()
);
  });
});
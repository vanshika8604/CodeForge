import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRoomForm } from "./CreateRoomForm";

describe("CreateRoomForm", () => {
  it("does not call onCreate if the name field is empty", async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn();

    render(<CreateRoomForm onCreate={handleCreate} />);

    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(handleCreate).not.toHaveBeenCalled();
  });

  it("calls onCreate with the name and selected language", async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn().mockResolvedValue(undefined);

    render(<CreateRoomForm onCreate={handleCreate} />);

    await user.type(screen.getByPlaceholderText("Room name"), "DSA Practice");
    await user.selectOptions(screen.getByRole("combobox"), "python");
    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(handleCreate).toHaveBeenCalledWith("DSA Practice", "python");
  });

  it("clears the name field after a successful create", async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn().mockResolvedValue(undefined);

    render(<CreateRoomForm onCreate={handleCreate} />);

    const nameInput = screen.getByPlaceholderText("Room name") as HTMLInputElement;
    await user.type(nameInput, "DSA Practice");
    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(nameInput.value).toBe("");
  });
});
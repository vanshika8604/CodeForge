import { render, screen } from "@testing-library/react";
import { PresenceList } from "./PresenceList";

describe("PresenceList", () => {
  it("shows a count of 1 when no other users are present", () => {
    render(<PresenceList users={[]} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByTitle("You")).toBeInTheDocument();
  });

  it("shows the correct count and user initials when other users are present", () => {
    render(
      <PresenceList
        users={[
          { userId: "1", name: "Ada Lovelace" },
          { userId: "2", name: "Grace Hopper" },
        ]}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByTitle("You")).toBeInTheDocument();
    expect(screen.getByTitle("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByTitle("Grace Hopper")).toBeInTheDocument();

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
  });
});
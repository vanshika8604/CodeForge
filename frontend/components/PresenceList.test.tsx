import { render, screen } from "@testing-library/react";
import { PresenceList } from "./PresenceList";

describe("PresenceList", () => {
  it("shows a count of 1 (just 'You') when no other users are present", () => {
    render(<PresenceList users={[]} />);

    expect(screen.getByText("In this room (1)")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("shows the correct count and names when other users are present", () => {
    render(
      <PresenceList
        users={[
          { userId: "u1", name: "Ada Lovelace" },
          { userId: "u2", name: "Grace Hopper" },
        ]}
      />
    );

    expect(screen.getByText("In this room (3)")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });
});
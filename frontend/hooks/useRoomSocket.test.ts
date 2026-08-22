import { renderHook, waitFor, act } from "@testing-library/react";
import { useRoomSocket } from "./useRoomSocket";
import { FakeSocket } from "@/testUtils/fakeSocket";

let fakeSocket: FakeSocket;

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => fakeSocket),
}));

jest.mock("@/lib/api", () => ({
  api: { rooms: { getMessages: jest.fn() } },
}));

import { api } from "@/lib/api";

describe("useRoomSocket", () => {
  beforeEach(() => {
    fakeSocket = new FakeSocket();
    (api.rooms.getMessages as jest.Mock).mockResolvedValue({ messages: [] });
  });

  function simulateSuccessfulJoin(overrides = {}) {
    act(() => {
      fakeSocket.__trigger("connect");
    });

    const joinCall = fakeSocket.emitted.find((e) => e.event === "room:join");
    const ack = joinCall?.args[1]; // (roomId, callback)

    act(() => {
      ack({
        ok: true,
        code: "console.log(1)",
        language: "javascript",
        presentUsers: [],
        ...overrides,
      });
    });
  }

  it("emits room:join with the roomId once connected", () => {
    renderHook(() => useRoomSocket("room-1"));

    act(() => {
      fakeSocket.__trigger("connect");
    });

    const joinCall = fakeSocket.emitted.find((e) => e.event === "room:join");
    expect(joinCall?.args[0]).toBe("room-1");
  });

  it("sets connected, initialCode, and initialLanguage from the join acknowledgement", async () => {
    const { result } = renderHook(() => useRoomSocket("room-1"));

    simulateSuccessfulJoin({ code: "print('hi')", language: "python" });

    await waitFor(() => expect(result.current.connected).toBe(true));
    expect(result.current.initialCode).toBe("print('hi')");
    expect(result.current.initialLanguage).toBe("python");
  });

  it("adds a user to presentUsers when room:user-joined fires, without duplicating an existing one", () => {
    const { result } = renderHook(() => useRoomSocket("room-1"));
    simulateSuccessfulJoin();

    act(() => {
      fakeSocket.__trigger("room:user-joined", { userId: "u2", name: "Ada" });
    });
    expect(result.current.presentUsers).toEqual([{ userId: "u2", name: "Ada" }]);

    // Same user "joins" again (e.g. a reconnect) — should not duplicate.
    act(() => {
      fakeSocket.__trigger("room:user-joined", { userId: "u2", name: "Ada" });
    });
    expect(result.current.presentUsers).toHaveLength(1);
  });

  it("removes a user from presentUsers when room:user-left fires", () => {
    const { result } = renderHook(() => useRoomSocket("room-1"));
    simulateSuccessfulJoin();

    act(() => {
      fakeSocket.__trigger("room:user-joined", { userId: "u2", name: "Ada" });
    });
    expect(result.current.presentUsers).toHaveLength(1);

    act(() => {
      fakeSocket.__trigger("room:user-left", { userId: "u2" });
    });
    expect(result.current.presentUsers).toHaveLength(0);
  });

  it("appends incoming chat:message events to messages", () => {
    const { result } = renderHook(() => useRoomSocket("room-1"));
    simulateSuccessfulJoin();

    act(() => {
      fakeSocket.__trigger("chat:message", {
        id: "m1",
        content: "hello",
        createdAt: "2026-01-01T00:00:00Z",
        sender: { id: "u2", name: "Ada" },
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("hello");
  });

  it("disconnects the socket on unmount", () => {
    const { unmount } = renderHook(() => useRoomSocket("room-1"));

    unmount();

    expect(fakeSocket.disconnected).toBe(true);
  });

  it("sendMessage emits chat:send with the roomId and content", () => {
    const { result } = renderHook(() => useRoomSocket("room-1"));

    act(() => {
      result.current.sendMessage("hi everyone");
    });

    const sendCall = fakeSocket.emitted.find((e) => e.event === "chat:send");
    expect(sendCall?.args[0]).toEqual({ roomId: "room-1", content: "hi everyone" });
  });
});
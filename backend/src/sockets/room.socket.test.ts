import request from "supertest";
import { io as ioClient, Socket } from "socket.io-client";

import { testApp } from "../testUtils/testApp";
import {
  startTestSocketServer,
  TestSocketServer,
} from "../testUtils/testSocketServer";
import { waitForEvent } from "../testUtils/waitForEvent";
import prisma from "../lib/prisma";

function extractCookie(res: request.Response): string {
  const rawCookies = res.headers["set-cookie"];

  const cookies = Array.isArray(rawCookies)
    ? rawCookies
    : rawCookies
      ? [rawCookies]
      : [];

  const tokenCookie = cookies.find((c: string) => c.startsWith("token="));

  if (!tokenCookie) {
    throw new Error("No auth cookie in response");
  }

  return tokenCookie.split(";")[0];
}

async function registerAndLogin(email: string, name: string) {
  await request(testApp)
    .post("/api/auth/register")
    .send({
      name,
      email,
      password: "secret123",
    });

  const loginRes = await request(testApp)
    .post("/api/auth/login")
    .send({
      email,
      password: "secret123",
    });

  return {
    cookie: extractCookie(loginRes),
    userId: loginRes.body.user?.id,
  };
}

function connectClient(port: number, cookie: string): Socket {
  return ioClient(`http://localhost:${port}`, {
    transports: ["websocket"],
    extraHeaders: {
      Cookie: cookie,
    },
  });
}

describe("Room socket events (integration)", () => {
  let server: TestSocketServer;

  let memberACookie: string;
  let memberBCookie: string;

  let roomId: string;

  let clientA: Socket;
  let clientB: Socket;

  beforeAll(async () => {
    server = await startTestSocketServer();
  });

  beforeEach(async () => {
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const memberA = await registerAndLogin(
      "membera@example.com",
      "Member A"
    );

    const memberB = await registerAndLogin(
      "memberb@example.com",
      "Member B"
    );

    memberACookie = memberA.cookie;
    memberBCookie = memberB.cookie;

    const createRes = await request(testApp)
      .post("/api/rooms")
      .set("Cookie", memberACookie)
      .send({
        name: "Socket Test Room",
      });

    expect(createRes.status).toBe(201);

    roomId = createRes.body.room.id;

    await request(testApp)
      .post("/api/rooms/join")
      .set("Cookie", memberBCookie)
      .send({
        joinCode: createRes.body.room.joinCode,
      });
  });

  afterEach(() => {
    clientA?.disconnect();
    clientB?.disconnect();
  });

  afterAll(async () => {
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    await server.close();

    await prisma.$disconnect();
  });

  it("lets an authenticated member join a room over a real socket connection", async () => {
    clientA = connectClient(server.port, memberACookie);

    await new Promise<void>((resolve, reject) => {
      clientA.on("connect", resolve);
      clientA.on("connect_error", reject);
    });

    const joinResult = await new Promise<any>((resolve) => {
      clientA.emit("room:join", roomId, resolve);
    });

    expect(joinResult.ok).toBe(true);
    expect(joinResult.code).toBe("");
    expect(joinResult.language).toBe("javascript");
    expect(joinResult.presentUsers).toEqual([]);
  });

  it("rejects a socket connection with no auth cookie", async () => {
    const unauthedClient = ioClient(
      `http://localhost:${server.port}`,
      {
        transports: ["websocket"],
      }
    );

    const connectError = await waitForEvent<Error>(
      unauthedClient,
      "connect_error"
    );

    expect(connectError.message).toBe("AUTH_TOKEN_MISSING");

    unauthedClient.disconnect();
  });

  it("broadcasts room:user-joined to an existing member when someone else joins", async () => {
    clientA = connectClient(server.port, memberACookie);

    await new Promise<void>((resolve, reject) => {
      clientA.on("connect", resolve);
      clientA.on("connect_error", reject);
    });

    await new Promise<any>((resolve) => {
      clientA.emit("room:join", roomId, resolve);
    });

    clientB = connectClient(server.port, memberBCookie);

    await new Promise<void>((resolve, reject) => {
      clientB.on("connect", resolve);
      clientB.on("connect_error", reject);
    });

    const joinedEventPromise = waitForEvent<{
      userId: string;
      name: string;
    }>(clientA, "room:user-joined");

    clientB.emit("room:join", roomId, () => {});

    const data = await joinedEventPromise;

    expect(data.name).toBe("Member B");
  });

  it("broadcasts code:update to other members but not back to the sender", async () => {
    clientA = connectClient(server.port, memberACookie);
    clientB = connectClient(server.port, memberBCookie);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        clientA.on("connect", resolve);
        clientA.on("connect_error", reject);
      }),
      new Promise<void>((resolve, reject) => {
        clientB.on("connect", resolve);
        clientB.on("connect_error", reject);
      }),
    ]);

    await Promise.all([
      new Promise<any>((resolve) => {
        clientA.emit("room:join", roomId, resolve);
      }),
      new Promise<any>((resolve) => {
        clientB.emit("room:join", roomId, resolve);
      }),
    ]);

    let clientAReceivedEcho = false;

    clientA.on("code:update", () => {
      clientAReceivedEcho = true;
    });

    const updatePromise = waitForEvent<{
      content: string;
    }>(clientB, "code:update");

    clientA.emit("code:change", {
      roomId,
      content: "console.log('hi')",
    });

    const data = await updatePromise;

    expect(data.content).toBe("console.log('hi')");

    // Give the sender's event loop a moment to process
    // any unexpected echo.
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(clientAReceivedEcho).toBe(false);

    // Wait for the production debounce save to complete
    // before afterAll removes the room.
    await new Promise((resolve) => setTimeout(resolve, 1600));
  });

  it("persists and broadcasts chat:message to all members including the sender", async () => {
    clientA = connectClient(server.port, memberACookie);
    clientB = connectClient(server.port, memberBCookie);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        clientA.on("connect", resolve);
        clientA.on("connect_error", reject);
      }),
      new Promise<void>((resolve, reject) => {
        clientB.on("connect", resolve);
        clientB.on("connect_error", reject);
      }),
    ]);

    await Promise.all([
      new Promise<any>((resolve) => {
        clientA.emit("room:join", roomId, resolve);
      }),
      new Promise<any>((resolve) => {
        clientB.emit("room:join", roomId, resolve);
      }),
    ]);

    const senderReceivesPromise = waitForEvent<{
      id: string;
      content: string;
      createdAt: string;
      sender: {
        id: string;
        name: string;
      };
    }>(clientA, "chat:message");

    const otherReceivesPromise = waitForEvent<{
      id: string;
      content: string;
      createdAt: string;
      sender: {
        id: string;
        name: string;
      };
    }>(clientB, "chat:message");

    const ackPromise = new Promise<any>((resolve) => {
      clientA.emit(
        "chat:send",
        {
          roomId,
          content: "hello room",
        },
        resolve
      );
    });

    const [ack, senderMsg, otherMsg] = await Promise.all([
      ackPromise,
      senderReceivesPromise,
      otherReceivesPromise,
    ]);

    expect(ack.ok).toBe(true);

    expect(senderMsg.content).toBe("hello room");
    expect(otherMsg.content).toBe("hello room");

    expect(senderMsg.sender.name).toBe("Member A");
    expect(otherMsg.sender.name).toBe("Member A");

    expect(senderMsg.id).toBe(otherMsg.id);

    const stored = await prisma.chatMessage.findMany({
      where: {
        roomId,
      },
    });

    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe("hello room");
  });
});
import request from "supertest";

import { testApp } from "../testUtils/testApp";

import prisma from "../lib/prisma";

function extractCookie(res: request.Response): string {
  const rawCookies = res.headers["set-cookie"];

  if (!rawCookies) {
    throw new Error("No Set-Cookie header found on response");
  }

  const cookies = Array.isArray(rawCookies)
    ? rawCookies
    : [rawCookies];

  const tokenCookie = cookies.find((c) =>
    c.startsWith("token=")
  );

  if (!tokenCookie) {
    throw new Error("No auth cookie in response");
  }

  return tokenCookie.split(";")[0];
}

async function registerAndLogin(
  email: string,
  name: string
): Promise<string> {
  const registerRes = await request(testApp)
    .post("/api/auth/register")
    .send({
      name,
      email,
      password: "secret123",
    });

  if (registerRes.status !== 201) {
    throw new Error(
      `Registration failed for ${email}: ${registerRes.status} ${JSON.stringify(
        registerRes.body
      )}`
    );
  }

  const loginRes = await request(testApp)
    .post("/api/auth/login")
    .send({
      email,
      password: "secret123",
    });

  if (loginRes.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${loginRes.status} ${JSON.stringify(
        loginRes.body
      )}`
    );
  }

  return extractCookie(loginRes);
}

describe("Room routes (integration)", () => {
  let ownerCookie: string;
  let outsiderCookie: string;

  beforeEach(async () => {
    // Delete dependent records first because of foreign-key constraints.
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    ownerCookie = await registerAndLogin(
      "owner@example.com",
      "Room Owner"
    );

    outsiderCookie = await registerAndLogin(
      "outsider@example.com",
      "Outsider"
    );
  });

  afterAll(async () => {
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  describe("POST /api/rooms", () => {
    it("creates a room and makes the creator its owner member", async () => {
      const res = await request(testApp)
        .post("/api/rooms")
        .set("Cookie", ownerCookie)
        .send({
          name: "DSA Practice",
          language: "python",
        });

      expect(res.status).toBe(201);
      expect(res.body.room.name).toBe("DSA Practice");
      expect(res.body.room.members).toHaveLength(1);
      expect(res.body.room.members[0].role).toBe("owner");
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(testApp)
        .post("/api/rooms")
        .send({
          name: "No Auth Room",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/rooms/:id — authorization boundary", () => {
    it("returns 200 for a member of the room", async () => {
      const createRes = await request(testApp)
        .post("/api/rooms")
        .set("Cookie", ownerCookie)
        .send({
          name: "DSA Practice",
        });

      expect(createRes.status).toBe(201);

      const roomId = createRes.body.room.id;

      const res = await request(testApp)
        .get(`/api/rooms/${roomId}`)
        .set("Cookie", ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.room.id).toBe(roomId);
    });

    it("returns 403 for an authenticated user who is NOT a member", async () => {
      const createRes = await request(testApp)
        .post("/api/rooms")
        .set("Cookie", ownerCookie)
        .send({
          name: "DSA Practice",
        });

      expect(createRes.status).toBe(201);

      const roomId = createRes.body.room.id;

      const res = await request(testApp)
        .get(`/api/rooms/${roomId}`)
        .set("Cookie", outsiderCookie);

      expect(res.status).toBe(403);
    });

    it("returns 404 for a room that doesn't exist", async () => {
      const res = await request(testApp)
        .get(
          "/api/rooms/00000000-0000-0000-0000-000000000000"
        )
        .set("Cookie", ownerCookie);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/rooms/join", () => {
    it("lets an outsider join via the correct join code, then access the room", async () => {
      const createRes = await request(testApp)
        .post("/api/rooms")
        .set("Cookie", ownerCookie)
        .send({
          name: "DSA Practice",
        });

      expect(createRes.status).toBe(201);

      const {
        id: roomId,
        joinCode,
      } = createRes.body.room;

      expect(joinCode).toBeDefined();

      const joinRes = await request(testApp)
        .post("/api/rooms/join")
        .set("Cookie", outsiderCookie)
        .send({
          joinCode,
        });

      expect(joinRes.status).toBe(200);

      const getRes = await request(testApp)
        .get(`/api/rooms/${roomId}`)
        .set("Cookie", outsiderCookie);

      expect(getRes.status).toBe(200);
      expect(getRes.body.room.id).toBe(roomId);
    });

    it("returns 404 for a bogus join code", async () => {
      const res = await request(testApp)
        .post("/api/rooms/join")
        .set("Cookie", outsiderCookie)
        .send({
          joinCode: "NOTREAL",
        });

      expect(res.status).toBe(404);
    });
  });
});
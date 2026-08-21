import request from "supertest";
import { testApp } from "../testUtils/testApp";
import prisma from "../lib/prisma";

const COOKIE_NAME = "token";

function extractCookie(res: request.Response): string {
  const rawCookies = res.headers["set-cookie"];

  if (!rawCookies) {
    throw new Error("No Set-Cookie header found on response");
  }

  const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

  const tokenCookie = cookies.find((c) =>
    c.startsWith(`${COOKIE_NAME}=`)
  );

  if (!tokenCookie) {
    throw new Error(`No ${COOKIE_NAME} cookie found in Set-Cookie header`);
  }

  return tokenCookie.split(";")[0];
}

describe("Auth session routes (integration)", () => {
  const testUser = {
    name: "Ada Lovelace",
    email: "ada-session@example.com",
    password: "secret123",
  };

 beforeEach(async () => {
  await prisma.chatMessage.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
});

  afterAll(async () => {
  await prisma.chatMessage.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});

  describe("GET /api/auth/me", () => {
    it("returns 200 and the correct user when a valid login cookie is sent", async () => {
      await request(testApp)
        .post("/api/auth/register")
        .send(testUser);

      const loginRes = await request(testApp)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const cookie = extractCookie(loginRes);

      const meRes = await request(testApp)
        .get("/api/auth/me")
        .set("Cookie", cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe(testUser.email);
      expect(meRes.body.user.name).toBe(testUser.name);
      expect(meRes.body.user.password).toBeUndefined();
    });

    it("returns 401 when no cookie is sent", async () => {
      const res = await request(testApp)
        .get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("returns 401 when the cookie value is invalid", async () => {
      const res = await request(testApp)
        .get("/api/auth/me")
        .set(
          "Cookie",
          `${COOKIE_NAME}=this.is.not.a.valid.jwt`
        );

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("succeeds and clears the auth cookie", async () => {
      await request(testApp)
        .post("/api/auth/register")
        .send(testUser);

      const loginRes = await request(testApp)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const cookie = extractCookie(loginRes);

      const logoutRes = await request(testApp)
        .post("/api/auth/logout")
        .set("Cookie", cookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.ok).toBe(true);

      const rawClearedCookies = logoutRes.headers["set-cookie"];

      const clearedCookies = Array.isArray(rawClearedCookies)
        ? rawClearedCookies
        : rawClearedCookies
          ? [rawClearedCookies]
          : [];

      const clearedCookieHeader = clearedCookies.find((c) =>
        c.startsWith(`${COOKIE_NAME}=`)
      );

      expect(clearedCookieHeader).toBeDefined();

      // The cookie should be cleared by either:
      // 1. An empty value, or
      // 2. An immediate/past expiration.
      const isEmptied = /token=;/.test(clearedCookieHeader!);

      const isExpired =
        /Expires=Thu, 01 Jan 1970/i.test(clearedCookieHeader!) ||
        /Max-Age=0/i.test(clearedCookieHeader!);

      expect(isEmptied || isExpired).toBe(true);
    });
  });
});
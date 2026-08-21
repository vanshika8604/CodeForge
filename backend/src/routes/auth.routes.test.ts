import request from "supertest";
import { testApp } from "../testUtils/testApp";
import prisma from "../lib/prisma";

describe("Auth routes (integration)", () => {
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

  describe("POST /api/auth/register", () => {
    it("registers a new user and returns 201", async () => {
      const res = await request(testApp).post("/api/auth/register").send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("ada@example.com");
      expect(res.body.user.password).toBeUndefined();
    });

    it("returns 409 when the email is already registered", async () => {
      await request(testApp).post("/api/auth/register").send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      });

      const res = await request(testApp).post("/api/auth/register").send({
        name: "Someone Else",
        email: "ada@example.com",
        password: "different123",
      });

      expect(res.status).toBe(409);
    });

    it("returns 400 for an invalid email", async () => {
      const res = await request(testApp).post("/api/auth/register").send({
        name: "Ada",
        email: "not-an-email",
        password: "secret123",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(testApp).post("/api/auth/register").send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      });
    });

    it("logs in with correct credentials and sets a cookie", async () => {
      const res = await request(testApp).post("/api/auth/login").send({
        email: "ada@example.com",
        password: "secret123",
      });

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/);
    });

    it("returns 401 for a wrong password", async () => {
      const res = await request(testApp).post("/api/auth/login").send({
        email: "ada@example.com",
        password: "wrong-password",
      });

      expect(res.status).toBe(401);
    });
  });
});
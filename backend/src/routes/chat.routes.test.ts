import request from "supertest";
import { testApp } from "../testUtils/testApp";
import prisma from "../lib/prisma";

function extractCookie(res: request.Response): string {
const rawCookies = res.headers["set-cookie"] as unknown as string[] | undefined;
const tokenCookie = rawCookies?.find((c) => c.startsWith("token="));
  if (!tokenCookie) throw new Error("No auth cookie in response");
  return tokenCookie.split(";")[0];
}

async function registerAndLogin(email: string, name: string) {
  await request(testApp).post("/api/auth/register").send({ name, email, password: "secret123" });
  const loginRes = await request(testApp).post("/api/auth/login").send({ email, password: "secret123" });
  return extractCookie(loginRes);
}

describe("Chat history route (integration)", () => {
  let memberCookie: string;
  let outsiderCookie: string;
  let roomId: string;

  beforeEach(async () => {
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    memberCookie = await registerAndLogin("member@example.com", "Member");
    outsiderCookie = await registerAndLogin("outsider@example.com", "Outsider");

    const createRes = await request(testApp)
      .post("/api/rooms")
      .set("Cookie", memberCookie)
      .send({ name: "Chat Test Room" });

    roomId = createRes.body.room.id;

    await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: (await prisma.user.findUnique({ where: { email: "member@example.com" } }))!.id,
        content: "an earlier message",
      },
    });
  });

  afterAll(async () => {
    await prisma.chatMessage.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("returns chat history for a room member", async () => {
    const res = await request(testApp)
      .get(`/api/rooms/${roomId}/messages`)
      .set("Cookie", memberCookie);

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.messages[0].content).toBe("an earlier message");
  });

  it("returns 403 for a non-member trying to read chat history", async () => {
    const res = await request(testApp)
      .get(`/api/rooms/${roomId}/messages`)
      .set("Cookie", outsiderCookie);

    expect(res.status).toBe(403);
  });
});
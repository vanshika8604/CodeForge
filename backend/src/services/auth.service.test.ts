import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { registerUser, loginUser } from "./auth.service";

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("auth.service", () => {
  describe("registerUser", () => {
    it("creates a new user when the email is not already taken", async () => {
      // Arrange
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockedPrisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "hashed-password",
      });
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (mockedJwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

      // Act
      const result = await registerUser({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "secret123",
      });

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("secret123", 10);
      expect(result.user).toEqual({
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
      });
      expect(result.token).toBe("fake-jwt-token");
    });

    it("throws EMAIL_ALREADY_IN_USE when the email already exists", async () => {
      // Arrange
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: "ada@example.com",
      });

      // Act & Assert
      await expect(
        registerUser({ name: "Ada", email: "ada@example.com", password: "secret123" })
      ).rejects.toThrow("EMAIL_ALREADY_IN_USE");

      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("returns a token when credentials are correct", async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "hashed-password",
      });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

      const result = await loginUser({ email: "ada@example.com", password: "secret123" });

      expect(result.token).toBe("fake-jwt-token");
    });

    it("throws INVALID_CREDENTIALS when the password is wrong", async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "ada@example.com",
        password: "hashed-password",
      });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        loginUser({ email: "ada@example.com", password: "wrong-password" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("throws INVALID_CREDENTIALS when no user exists (not a different error)", async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        loginUser({ email: "nobody@example.com", password: "whatever" })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });
  });
});
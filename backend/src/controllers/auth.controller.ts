import { Request, Response } from "express";
import { registerUser, loginUser, getUserById } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { setAuthCookie, clearAuthCookie } from "../utils/cookies";

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);
    setAuthCookie(res, result.token);
    return res.status(201).json({ user: result.user });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_IN_USE") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);
    setAuthCookie(res, result.token);
    return res.status(200).json({ user: result.user });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function logout(req: Request, res: Response) {
  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await getUserById(req.userId!);
    return res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
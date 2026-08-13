import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const result = await registerUser({ name, email, password });
    return res.status(201).json(result);
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
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
import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// @route   POST /api/auth/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "all fields are required" });
      return;
    }

    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "this email is already used" });
      return;
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "user created successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

export default router;

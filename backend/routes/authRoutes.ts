import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  xp: number;
  level: number;
}

// @route   POST /api/auth/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "This email is already used" });
      return;
    }

    // Création du nouvel utilisateur avec XP = 0 et Level = 1
    const newUser = new User({ name, email, password, xp: 0, level: 1 });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        xp: newUser.xp,
        level: newUser.level,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

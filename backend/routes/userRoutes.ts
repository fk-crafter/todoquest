import express, { Request, Response } from "express";
import User from "../models/User";
import Task from "../models/Task";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import protect from "../middleware/authMiddleware";

const router = express.Router();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  xp: number;
  level: number;
}

// @route   GET /api/users/:id
// @desc    Récupérer les infos d’un utilisateur
// @access  Privé (authentifié)
router.get(
  "/:id",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/users/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Email or password incorrect" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Email or password incorrect" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      message: "Connection successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Récupérer les stats du joueur (XP, Level, Tâches accomplies)
// @access  Privé (authentifié)
router.get(
  "/:id/stats",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const completedTasks = await Task.countDocuments({
        userId: user._id,
        completed: true,
      });

      res.status(200).json({
        xp: user.xp,
        level: user.level,
        completedTasks,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Supprimer son compte
// @access  Privé (authentifié)
router.delete(
  "/:id",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await User.deleteOne({ _id: user._id });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

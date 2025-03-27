import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import protect from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/users/:id
// @desc    Récupérer les infos d’un utilisateur
// @access  Privé (authentifié)
router.get(
  "/:id",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { id: true, name: true, email: true, xp: true, level: true },
      });

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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Email or password incorrect" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Email or password incorrect" });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      message: "Connection successful",
      token,
      user: {
        id: user.id,
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
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const tasksCreated = await prisma.task.count({
        where: { userId: user.id },
      });

      const tasksCompleted = await prisma.task.count({
        where: { userId: user.id, completed: true },
      });

      const isNew = user.level === 1 && user.xp === 0 && tasksCompleted === 0;

      res.status(200).json({
        xp: user.xp,
        level: user.level,
        tasksCreated,
        tasksCompleted,
        isNew,
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
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await prisma.user.delete({ where: { id: user.id } });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

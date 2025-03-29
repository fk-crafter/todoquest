import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import protect, { AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/tasks
// @desc    Créer une nouvelle tâche
// @access  Privé (authentifié)
router.post(
  "/",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;

      if (!title) {
        res.status(400).json({ message: "Title is required" });
        return;
      }

      const newTask = await prisma.task.create({
        data: {
          userId: req.user?.id!,
          title,
          description,
        },
      });

      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/tasks
// @desc    Récupérer toutes les tâches de l'utilisateur connecté
// @access  Privé (authentifié)
router.get(
  "/",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user?.id! },
      });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   PUT /api/tasks/:taskId/complete
// @desc    Marquer une tâche comme complétée et ajouter de l'XP à l'utilisateur
// @access  Privé (authentifié)
router.put(
  "/:taskId/complete",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { timeSpent } = req.body;
      const userId = req.user?.id!;

      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.completed) {
        res.status(400).json({ message: "Task already completed" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      let xpGained =
        user.level <= 5
          ? 50
          : user.level <= 10
          ? 25
          : user.level <= 20
          ? 15
          : 10;

      let newXP = user.xp + xpGained;
      let newLevel = user.level;

      if (newXP >= 100) {
        newLevel += 1;
        newXP = 0;
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          completed: true,
          completedAt: new Date(),
          gainedXp: xpGained,
          timeSpent: timeSpent ?? null,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: newXP,
          level: newLevel,
        },
      });

      res.status(200).json({
        message: "Task completed and XP added",
        xpGained,
        newXP,
        newLevel,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/tasks/:taskId
// @desc    Supprimer une tâche (et restituer les XP si complétée)
// @access  Privé (authentifié)
router.delete(
  "/:taskId",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: req.params.taskId },
      });

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.completed) {
        const user = await prisma.user.findUnique({
          where: { id: task.userId },
        });

        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        const xpToRestore = task.gainedXp ?? 0;
        let newXP = user.xp - xpToRestore;
        let newLevel = user.level;

        while (newXP < 0 && newLevel > 1) {
          newLevel -= 1;
          newXP += 100;
        }

        if (newLevel === 1 && newXP < 0) {
          newXP = 0;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            xp: newXP,
            level: newLevel,
          },
        });
      }

      await prisma.task.delete({ where: { id: task.id } });

      res
        .status(200)
        .json({ message: "Task deleted and XP restored if completed" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

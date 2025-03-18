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
      const task = await prisma.task.findUnique({
        where: { id: req.params.taskId },
      });

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.completed) {
        res.status(400).json({ message: "Task already completed" });
        return;
      }

      // Mettre à jour la tâche en tant que complétée
      await prisma.task.update({
        where: { id: task.id },
        data: { completed: true },
      });

      // Ajouter l'XP à l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id! },
      });

      if (user) {
        let xpGained = 10;

        if (user.level <= 5) {
          xpGained = 50;
        } else if (user.level <= 10) {
          xpGained = 25;
        } else if (user.level <= 20) {
          xpGained = 15;
        } else {
          xpGained = 10;
        }

        let newXP = user.xp + xpGained;
        let newLevel = user.level;

        if (newXP >= 100) {
          newLevel += 1;
          newXP = 0;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { xp: newXP, level: newLevel },
        });
      }

      res.status(200).json({ message: "Task completed and XP added" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/tasks/:taskId
// @desc    Supprimer une tâche
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

      await prisma.task.delete({ where: { id: task.id } });

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

import express, { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import protect, { AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

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

      const newTask = await Task.create({
        userId: req.user?.id,
        title,
        description,
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
      const tasks = await Task.find({ userId: req.user?.id });
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
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.completed) {
        res.status(400).json({ message: "Task already completed" });
        return;
      }

      task.completed = true;
      await task.save();

      const user = await User.findById(req.user?.id);
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

        user.xp += xpGained;

        if (user.xp >= 100) {
          user.level += 1;
          user.xp = 0;
        }

        await user.save();
      }

      res
        .status(200)
        .json({ message: "Task completed and XP added", task, user });
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
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      await Task.deleteOne({ _id: req.params.taskId });

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

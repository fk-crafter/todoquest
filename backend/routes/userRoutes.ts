import express, { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import protect from "../middleware/authMiddleware";
import admin from "../middleware/adminMiddleware";

const router = express.Router();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

// @route   GET /api/users
// @desc    Récupérer tous les utilisateurs (admin uniquement)
// @access  Privé (authentifié)
router.get(
  "/",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users: IUser[] = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   POST /api/users/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "this user already exists" });
      return;
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

// @route   POST /api/users/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "email or password incorrect" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "email or password incorrect" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "connection successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.delete(
  "/:id",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      await User.deleteOne({ _id: user._id });
      res.json({ message: "user deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Modifier les informations d'un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.put(
  "/:id",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, role } = req.body; // Récupérer les champs à modifier
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;

      const updatedUser = await user.save({ validateBeforeSave: false });
      res.json(updatedUser);
    } catch (error) {
      console.error("update error:", error);
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   PUT /api/users/:id/role
// @desc    Modifier le rôle d'un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.put(
  "/:id/role",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }

      user.role = user.role === "admin" ? "user" : "admin";

      const updatedUser = await user.save({ validateBeforeSave: false });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

export default router;

import express, { Request, Response } from "express";
import { Document, ObjectId } from "mongoose";
import Order from "../models/Order";
import protect from "../middleware/authMiddleware";
import admin from "../middleware/adminMiddleware";

const router = express.Router();

export interface AuthenticatedRequest extends Request {
  user?: { _id: ObjectId };
  body: {
    products?: { product: ObjectId; quantity: number }[];
    totalPrice?: number;
  };
}

interface IOrder extends Document {
  _id: ObjectId;
  user: ObjectId;
  products: { product: ObjectId; quantity: number }[];
  totalPrice: number;
}

// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Privé (utilisateur connecté)
router.post(
  "/",
  protect,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { products, totalPrice } = req.body;

      if (!products || products.length === 0) {
        res.status(400).json({ message: "the order cannot be empty" });
        return;
      }

      const newOrder = new Order({
        user: req.user?._id,
        products,
        totalPrice,
      });

      const savedOrder = await newOrder.save();
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   GET /api/orders/my
// @desc    Récupérer les commandes de l'utilisateur connecté
// @access  Privé (utilisateur connecté)
router.get(
  "/my",
  protect,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orders = await Order.find({ user: req.user?._id })
        .populate("products.product", "name price")
        .lean();

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   GET /api/orders
// @desc    Récupérer toutes les commandes (Admin uniquement)
// @access  Privé (Admin)
router.get(
  "/",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .populate("products.product", "name price")
        .lean();

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   DELETE /api/orders/:id
// @desc    Supprimer une commande (Admin uniquement)
// @access  Privé (Admin)
router.delete(
  "/:id",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const order: IOrder | null = await Order.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: "order not found" });
        return;
      }

      await Order.deleteOne({ _id: order._id });

      res.json({ message: "order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

export default router;

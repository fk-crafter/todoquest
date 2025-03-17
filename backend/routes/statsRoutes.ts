import express, { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";
import protect from "../middleware/authMiddleware";
import admin from "../middleware/adminMiddleware";

const router = express.Router();

// @route   GET /api/stats
// @desc    Récupérer les statistiques du dashboard
// @access  Privé (Admin)
router.get(
  "/",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const totalProducts: number = await Product.countDocuments();
      const totalOrders: number = await Order.countDocuments();
      const totalUsers: number = await User.countDocuments();

      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);

      res.json({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

export default router;

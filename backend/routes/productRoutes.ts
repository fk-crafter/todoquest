import express, { Request, Response } from "express";
import { Document } from "mongoose";
import Product from "../models/Product";
import protect from "../middleware/authMiddleware";
import admin from "../middleware/adminMiddleware";

const router = express.Router();

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

// @route   GET /api/products
// @desc    Récupérer tous les produits
// @access  Public
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const products: IProduct[] = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const product: IProduct | null = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

// @route   POST /api/products
// @desc    Ajouter un produit (Admin uniquement)
// @access  Privé (Admin)
router.post(
  "/",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, stock, category, image } = req.body;

      if (
        !name ||
        !description ||
        !price ||
        stock === undefined ||
        !category ||
        !image
      ) {
        res.status(400).json({ message: "all fields are required." });
        return;
      }

      if (isNaN(price) || isNaN(stock)) {
        res.status(400).json({ message: "price and stock must be numbers." });
        return;
      }

      const newProduct = new Product({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        image,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Modifier un produit (Admin uniquement)
// @access  Privé (Admin)
router.put(
  "/:id",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, stock, category, image } = req.body;
      const product: (IProduct & Document) | null = await Product.findById(
        req.params.id
      );

      if (!product) {
        res.status(404).json({ message: "product not found" });
        return;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.stock = stock || product.stock;
      product.category = category || product.category;
      product.image = image || product.image;

      const updatedProduct = await product.save({ validateBeforeSave: false });
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit (Admin uniquement)
// @access  Privé (Admin)
router.delete(
  "/:id",
  protect,
  admin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product: (IProduct & Document) | null = await Product.findById(
        req.params.id
      );

      if (!product) {
        res.status(404).json({ message: "product not found" });
        return;
      }

      await Product.deleteOne({ _id: product._id });

      res.json({ message: "product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  }
);

export default router;

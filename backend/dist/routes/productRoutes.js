"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middleware/adminMiddleware"));
const router = express_1.default.Router();
// @route   GET /api/products
// @desc    Récupérer tous les produits
// @access  Public
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.default.find({});
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   GET /api/products/:id
// @desc    Récupérer un produit par son ID
// @access  Public
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   POST /api/products
// @desc    Ajouter un produit (Admin uniquement)
// @access  Privé (Admin)
router.post("/", authMiddleware_1.default, adminMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, stock, category, image } = req.body;
        if (!name ||
            !description ||
            !price ||
            stock === undefined ||
            !category ||
            !image) {
            res.status(400).json({ message: "Tous les champs sont requis." });
            return;
        }
        if (isNaN(price) || isNaN(stock)) {
            res
                .status(400)
                .json({ message: "Le prix et le stock doivent être des nombres." });
            return;
        }
        const newProduct = new Product_1.default({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            image,
        });
        const savedProduct = yield newProduct.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   PUT /api/products/:id
// @desc    Modifier un produit (Admin uniquement)
// @access  Privé (Admin)
router.put("/:id", authMiddleware_1.default, adminMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, stock, category, image } = req.body;
        const product = yield Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.category = category || product.category;
        product.image = image || product.image;
        const updatedProduct = yield product.save({ validateBeforeSave: false });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   DELETE /api/products/:id
// @desc    Supprimer un produit (Admin uniquement)
// @access  Privé (Admin)
router.delete("/:id", authMiddleware_1.default, adminMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé" });
            return;
        }
        yield Product_1.default.deleteOne({ _id: product._id });
        res.json({ message: "Produit supprimé avec succès" });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
exports.default = router;

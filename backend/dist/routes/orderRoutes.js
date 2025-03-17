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
const Order_1 = __importDefault(require("../models/Order"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middleware/adminMiddleware"));
const router = express_1.default.Router();
// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Privé (utilisateur connecté)
router.post("/", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { products, totalPrice } = req.body;
        if (!products || products.length === 0) {
            res.status(400).json({ message: "La commande ne peut pas être vide" });
            return;
        }
        const newOrder = new Order_1.default({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            products,
            totalPrice,
        });
        const savedOrder = yield newOrder.save();
        res.status(201).json(savedOrder);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   GET /api/orders/my
// @desc    Récupérer les commandes de l'utilisateur connecté
// @access  Privé (utilisateur connecté)
router.get("/my", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const orders = yield Order_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate("products.product", "name price")
            .lean();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   GET /api/orders
// @desc    Récupérer toutes les commandes (Admin uniquement)
// @access  Privé (Admin)
router.get("/", authMiddleware_1.default, adminMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.default.find()
            .populate("user", "name email")
            .populate("products.product", "name price")
            .lean();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
// @route   DELETE /api/orders/:id
// @desc    Supprimer une commande (Admin uniquement)
// @access  Privé (Admin)
router.delete("/:id", authMiddleware_1.default, adminMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: "Commande non trouvée" });
            return;
        }
        yield Order_1.default.deleteOne({ _id: order._id });
        res.json({ message: "Commande supprimée avec succès" });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}));
exports.default = router;

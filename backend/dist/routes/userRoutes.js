"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const authMiddleware_1 = __importDefault(
  require("../middleware/authMiddleware")
);
const adminMiddleware_1 = __importDefault(
  require("../middleware/adminMiddleware")
);
const router = express_1.default.Router();
// @route   GET /api/users
// @desc    Récupérer tous les utilisateurs (admin uniquement)
// @access  Privé (authentifié)
router.get(
  "/",
  authMiddleware_1.default,
  adminMiddleware_1.default,
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const users = yield User_1.default.find({});
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
      }
    })
);
// @route   POST /api/users/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post("/register", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { name, email, password } = req.body;
      const userExists = yield User_1.default.findOne({ email });
      if (userExists) {
        res.status(400).json({ message: "Cet utilisateur existe déjà" });
        return;
      }
      const newUser = new User_1.default({ name, email, password });
      yield newUser.save();
      res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  })
);
// @route   POST /api/users/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post("/login", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { email, password } = req.body;
      const user = yield User_1.default.findOne({ email });
      if (!user) {
        res.status(401).json({ message: "email or password incorrect" });
        return;
      }
      const isMatch = yield bcryptjs_1.default.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "email or password incorrect" });
        return;
      }
      const token = jsonwebtoken_1.default.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
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
      res.status(500).json({ message: "Erreur serveur" });
    }
  })
);
// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.delete(
  "/:id",
  authMiddleware_1.default,
  adminMiddleware_1.default,
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
          res.status(404).json({ message: "user not found" });
          return;
        }
        yield User_1.default.deleteOne({ _id: user._id });
        res.json({ message: "user deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
      }
    })
);
// @route   PUT /api/users/:id
// @desc    Modifier les informations d'un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.put(
  "/:id",
  authMiddleware_1.default,
  adminMiddleware_1.default,
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const { name, email, role } = req.body; // Récupérer les champs à modifier
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
          res.status(404).json({ message: "user not found" });
          return;
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        const updatedUser = yield user.save({ validateBeforeSave: false });
        res.json(updatedUser);
      } catch (error) {
        console.error("update error:", error);
        res.status(500).json({ message: "server error" });
      }
    })
);
// @route   PUT /api/users/:id/role
// @desc    Modifier le rôle d'un utilisateur (Admin uniquement)
// @access  Privé (Admin)
router.put(
  "/:id/role",
  authMiddleware_1.default,
  adminMiddleware_1.default,
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
          res.status(404).json({ message: "user not found" });
          return;
        }
        user.role = user.role === "admin" ? "user" : "admin";
        const updatedUser = yield user.save({ validateBeforeSave: false });
        res.json(updatedUser);
      } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
      }
    })
);
exports.default = router;

import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied, admin privileges required" });
  }
};

export default admin;

import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export interface AuthRequest extends Request {
  headers: {
    authorization?: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      if (!decoded.id) {
        res.status(401).json({ message: "Token invalide" });
        return;
      }

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401).json({ message: "Accès non autorisé, token invalide" });
    }
  } else {
    res.status(401).json({ message: "Accès non autorisé, aucun token fourni" });
  }
};

export default protect;

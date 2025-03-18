import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    xp: number;
    level: number;
  };
}

const prisma = new PrismaClient();

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
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
      };

      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized, no token provided" });
  }
};

export default protect;

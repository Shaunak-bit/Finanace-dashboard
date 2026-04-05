import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const middleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: number; role: string };

        (req as any).user = verified;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export default middleware;
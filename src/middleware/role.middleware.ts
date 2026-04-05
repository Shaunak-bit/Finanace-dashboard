import type { Request, Response, NextFunction } from "express";

const allowRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};

export default allowRoles;
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["ADMIN", "ANALYST", "VIEWER"] as const;
const VALID_STATUSES = ["ACTIVE", "INACTIVE"] as const;

type Role = (typeof VALID_ROLES)[number];
type Status = (typeof VALID_STATUSES)[number];


export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!role) {
            return res.status(400).json({ message: "Role is required" });
        }

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({
                message: `Role must be one of: ${VALID_ROLES.join(", ")}`,
            });
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        console.error("[createUser]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        console.error("[getAllUsers]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        const { role } = req.body;
        const requesterId = req.user.userId;

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({
                message: `Role must be one of: ${VALID_ROLES.join(", ")}`,
            });
        }

        if (userId === requesterId) {
            return res.status(403).json({
                message: "You cannot change your own role",
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });

        return res.status(200).json({
            message: "Role updated successfully",
            data: updated,
        });
    } catch (error) {
        console.error("[updateUserRole]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        const { status } = req.body;
        const requesterId = req.user.userId;

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
            });
        }

        if (userId === requesterId) {
            return res.status(403).json({
                message: "You cannot change your own status",
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { status },
            select: { id: true, name: true, email: true, status: true },
        });

        return res.status(200).json({
            message: "Status updated successfully",
            data: updated,
        });
    } catch (error) {
        console.error("[updateUserStatus]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
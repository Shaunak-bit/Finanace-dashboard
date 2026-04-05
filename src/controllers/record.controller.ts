import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { RecordType, Prisma } from "../generated/prisma";

const VALID_TYPES = Object.values(RecordType);
const CATEGORY_MAX_LENGTH = 50;

const isValidAmount = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v) && v > 0;

const isValidType = (v: unknown): v is RecordType =>
    typeof v === "string" && VALID_TYPES.includes(v as RecordType);

const isValidCategory = (v: unknown): v is string =>
    typeof v === "string" &&
    v.trim().length > 0 &&
    v.trim().length <= CATEGORY_MAX_LENGTH;

const normalizeCategory = (v: string) => v.trim().toLowerCase();

const errorResponse = (
    res: Response,
    status: number,
    message: string,
    errors: string[] = []
) => res.status(status).json({ message, errors });



export const createRecord = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { amount, type, category, date, notes } = req.body;

        const errors: string[] = [];

        if (!isValidAmount(amount)) errors.push("amount must be a positive number");
        if (!isValidType(type)) errors.push("invalid type");
        if (!isValidCategory(category)) errors.push("invalid category");
        if (date && isNaN(Date.parse(date))) errors.push("invalid date");

        if (errors.length > 0) {
            return errorResponse(res, 400, "Validation failed", errors);
        }

        const record = await prisma.record.create({
            data: {
                amount,
                type,
                category: normalizeCategory(category),
                date: date ? new Date(date) : new Date(),
                notes:
                    typeof notes === "string" && notes.trim()
                        ? notes.trim()
                        : null,
                userId,
            },
            select: {
                id: true,
                amount: true,
                type: true,
                category: true,
                date: true,
                notes: true,
            },
        });

        return res.status(201).json({ message: "Record created", record });
    } catch (error) {
        console.error("[createRecord]", error);
        return errorResponse(res, 500, "Internal server error");
    }
};


export const getRecords = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { type, category, startDate, endDate } = req.query;

        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(
            100,
            Math.max(1, parseInt(req.query.pageSize as string, 10) || 20)
        );

        const skip = (page - 1) * pageSize;

        const errors: string[] = [];

        if (type && !isValidType(type)) errors.push("invalid type");
        if (category && !isValidCategory(category))
            errors.push("invalid category");
        if (startDate && isNaN(Date.parse(startDate as string)))
            errors.push("invalid startDate");
        if (endDate && isNaN(Date.parse(endDate as string)))
            errors.push("invalid endDate");

        if (errors.length > 0) {
            return errorResponse(res, 400, "Invalid query", errors);
        }

        const where: Prisma.RecordWhereInput = {
            userId,
            ...(type && { type: type as RecordType }),
            ...(category && {
                category: normalizeCategory(category as string),
            }),
            ...(startDate || endDate
                ? {
                    date: {
                        ...(startDate && { gte: new Date(startDate as string) }),
                        ...(endDate && { lte: new Date(endDate as string) }),
                    },
                }
                : {}),
        };

        const [records, total] = await prisma.$transaction([
            prisma.record.findMany({
                where,
                orderBy: { date: "desc" },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    amount: true,
                    type: true,
                    category: true,
                    date: true,
                    notes: true,
                },
            }),
            prisma.record.count({ where }),
        ]);

        return res.status(200).json({
            data: records,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("[getRecords]", error);
        return errorResponse(res, 500, "Internal server error");
    }
};



export const updateRecord = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const idParam = req.params.id;

        if (typeof idParam !== "string") {
            return errorResponse(res, 400, "Invalid record ID");
        }

        const recordId = parseInt(idParam, 10);

        if (isNaN(recordId)) {
            return errorResponse(res, 400, "Invalid record ID");
        }

        const { amount, type, category, date, notes } = req.body;

        const errors: string[] = [];

        if (amount !== undefined && !isValidAmount(amount))
            errors.push("invalid amount");
        if (type !== undefined && !isValidType(type))
            errors.push("invalid type");
        if (category !== undefined && !isValidCategory(category))
            errors.push("invalid category");
        if (date !== undefined && isNaN(Date.parse(date)))
            errors.push("invalid date");

        if (errors.length > 0) {
            return errorResponse(res, 400, "Validation failed", errors);
        }

        const safeData: Prisma.RecordUpdateInput = {
            ...(amount !== undefined && { amount }),
            ...(type !== undefined && { type }),
            ...(category !== undefined && {
                category: normalizeCategory(category),
            }),
            ...(date !== undefined && { date: new Date(date) }),
            ...(notes !== undefined && {
                notes:
                    typeof notes === "string" && notes.trim()
                        ? notes.trim()
                        : null,
            }),
        };

        if (Object.keys(safeData).length === 0) {
            return errorResponse(res, 400, "No fields to update");
        }

        const updated = await prisma.record.update({
            where: { id: recordId, userId },
            data: safeData,
            select: {
                id: true,
                amount: true,
                type: true,
                category: true,
                date: true,
                notes: true,
            },
        });

        return res.status(200).json({ message: "Updated", record: updated });
    } catch (error: any) {
        if (error.code === "P2025") {
            return errorResponse(res, 404, "Record not found or access denied");
        }
        console.error("[updateRecord]", error);
        return errorResponse(res, 500, "Internal server error");
    }
};


export const deleteRecord = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const idParam = req.params.id;

        if (typeof idParam !== "string") {
            return errorResponse(res, 400, "Invalid record ID");
        }

        const recordId = parseInt(idParam, 10);

        if (isNaN(recordId)) {
            return errorResponse(res, 400, "Invalid record ID");
        }

        await prisma.record.delete({
            where: { id: recordId, userId },
        });

        return res.status(204).send();
    } catch (error: any) {
        if (error.code === "P2025") {
            return errorResponse(res, 404, "Record not found or access denied");
        }
        console.error("[deleteRecord]", error);
        return errorResponse(res, 500, "Internal server error");
    }
};
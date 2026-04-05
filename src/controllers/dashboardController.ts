import { Request, Response } from "express";
import prisma from "../lib/prisma";


export const getSummary = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;

        const [income, expense] = await Promise.all([
            prisma.record.aggregate({
                where: {
                    userId,
                    type: "INCOME"
                },
                _sum: {
                    amount: true
                }
            }),
            prisma.record.aggregate({
                where: {
                    userId,
                    type: "EXPENSE"
                },
                _sum: {
                    amount: true
                }
            })
        ])
        const totalIncome = income._sum.amount || 0;
        const totalExpenses = expense._sum.amount || 0;

        const netBalance = totalIncome - totalExpenses;

        return res.status(200).json({
            message: "Summary fetched successfully",
            data: {
                totalIncome,
                totalExpenses,
                netBalance
            }
        })


    }
    catch (error) {
        console.error("[getSummary]", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getCategoryBreakdown = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const group = await prisma.record.groupBy({
            by: ["category"],
            where: {
                userId,
                type: "EXPENSE",
            },
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
        });


        const categories = group.map((item) => ({
            category: item.category,
            total: item._sum.amount || 0,
        }));

        return res.status(200).json({
            message: "Category breakdown fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error("[getCategoryBreakdown]", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;

        const records = await prisma.record.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 10,
            select: {
                amount: true,
                type: true,
                category: true,
                date: true,
            },
        });

        return res.status(200).json({
            message: "Recent activity fetched successfully",
            data: records,
        });
    } catch (error) {
        console.error("[getRecentActivity]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMonthlyTrend = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;

        const records = await prisma.record.findMany({
            where: { userId },
            select: {
                amount: true,
                type: true,
                date: true,
            },
        });

        const trendMap: Record<string, { income: number; expense: number; _date: Date }> = {};

        for (const record of records) {
            const date = new Date(record.date);
            const month = date.toLocaleString("en-US", { month: "short", year: "numeric" });

            if (!trendMap[month]) {
                trendMap[month] = { income: 0, expense: 0, _date: new Date(date.getFullYear(), date.getMonth(), 1) };
            }

            if (record.type === "INCOME") {
                trendMap[month].income += record.amount;
            } else if (record.type === "EXPENSE") {
                trendMap[month].expense += record.amount;
            }
        }

        const trend = Object.entries(trendMap)
            .sort(([, a], [, b]) => a._date.getTime() - b._date.getTime())
            .map(([month, { income, expense }]) => ({ month, income, expense }));

        return res.status(200).json({
            message: "Monthly trend fetched successfully",
            data: trend,
        });
    } catch (error) {
        console.error("[getMonthlyTrend]", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


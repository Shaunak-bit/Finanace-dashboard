import express from "express";
import {
    getSummary,
    getCategoryBreakdown,
    getRecentActivity,
    getMonthlyTrend
} from "../controllers/dashboardController";

import authMiddleware from "../middleware/auth.middleware";
import allowRoles from "../middleware/role.middleware";

const router = express.Router();

router.get("/summary", authMiddleware, allowRoles("ADMIN", "ANALYST"), getSummary);
router.get("/categories", authMiddleware, allowRoles("ADMIN", "ANALYST"), getCategoryBreakdown);
router.get("/recent", authMiddleware, allowRoles("ADMIN", "ANALYST"), getRecentActivity);
router.get("/monthly", authMiddleware, allowRoles("ADMIN", "ANALYST"), getMonthlyTrend);

export default router;
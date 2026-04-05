import express from "express";
import middleware from "../middleware/auth.middleware";
import allowRoles from "../middleware/role.middleware";
import { createRecord, getRecords, updateRecord, deleteRecord } from "../controllers/record.controller";
const router = express.Router();

router.post("/", middleware, allowRoles("ADMIN"), createRecord);
router.get("/", middleware, allowRoles("ADMIN", "ANALYST"), getRecords);
router.patch("/:id", middleware, allowRoles("ADMIN"), updateRecord);
router.delete("/:id", middleware, allowRoles("ADMIN"), deleteRecord);

export default router;
import express from "express";
import middleware from "../middleware/auth.middleware";
import allowRoles from "../middleware/role.middleware";

import {
    createUser,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
} from "../controllers/user.controller";

const router = express.Router();

router.use(middleware);

router.post("/", allowRoles("ADMIN"), createUser);

router.get("/", allowRoles("ADMIN"), getAllUsers);

router.patch("/:userId/role", allowRoles("ADMIN"), updateUserRole);

router.patch("/:userId/status", allowRoles("ADMIN"), updateUserStatus);

export default router;
// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import roleRoutes from "./roleRoutes.js";
import permissionRoutes from "./permissionRoutes.js";
import sessionRoutes from "./sessionRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/sessions", sessionRoutes);

export default router;

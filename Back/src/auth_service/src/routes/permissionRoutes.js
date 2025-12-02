// routes/permissionRoutes.js
import express from "express";
import permissionController from "../controllers/permissionController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize(["admin"]), permissionController.getAllPermissions);
router.post("/", authenticate, authorize(["admin"]), permissionController.createPermission);

export default router;

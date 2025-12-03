// routes/permissionRoutes.js
import express from "express";
import permissionController from "../controllers/permissionController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize(["admin"]), permissionController.getAllPermissions);
router.post("/", authenticate, authorize(["admin"]), permissionController.createPermission);
router.get("/:id", authenticate, authorize(["admin"]), permissionController.getPermissionById);
router.put("/:id", authenticate, authorize(["admin"]), permissionController.updatePermission);
router.delete("/:id", authenticate, authorize(["admin"]), permissionController.deletePermission);
router.get("/module/:module", authenticate, authorize(["admin"]), permissionController.getPermissionsByModule);

export default router;
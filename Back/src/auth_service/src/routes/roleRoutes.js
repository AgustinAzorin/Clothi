// routes/roleRoutes.js
import express from "express";
import roleController from "../controllers/roleController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// CRUD de roles
router.get("/", authenticate, authorize(["admin"]), roleController.getAllRoles);
router.post("/", authenticate, authorize(["admin"]), roleController.createRole);
router.get("/:id", authenticate, authorize(["admin"]), roleController.getRoleById);
router.put("/:id", authenticate, authorize(["admin"]), roleController.updateRole);
router.delete("/:id", authenticate, authorize(["admin"]), roleController.deleteRole);

// Gestión de permisos en roles
router.post("/:roleId/permissions", authenticate, authorize(["admin"]), roleController.assignPermission);
router.delete("/:roleId/permissions/:permissionId", authenticate, authorize(["admin"]), roleController.removePermission);

export default router;
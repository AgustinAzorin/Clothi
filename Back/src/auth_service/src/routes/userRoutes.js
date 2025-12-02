// routes/userRoutes.js
import express from "express";
import userController from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

/**
 * Perfil del usuario autenticado
 */
router.get("/me", authenticate, userController.getMe);
router.put("/me", authenticate, userController.updateProfile);
router.put("/me/password", authenticate, userController.updatePassword);

/**
 * Roles del usuario
 */
router.get("/:id/roles", authenticate, authorize(["admin"]), userController.getUserRoles);
router.post("/:id/roles", authenticate, authorize(["admin"]), userController.assignRole);
router.delete("/:id/roles/:roleId", authenticate, authorize(["admin"]), userController.removeRole);

/**
 * Sesiones / devices
 */
router.get("/me/sessions", authenticate, userController.getUserSessions);
router.delete("/me/sessions/:sessionId", authenticate, userController.invalidateSession);

export default router;

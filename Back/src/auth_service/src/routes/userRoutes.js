// routes/userRoutes.js
import express from "express";
import userController from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js"; // Si tienes middleware de autorización

const router = express.Router();

// Rutas para el usuario autenticado
router.get("/me", authenticate, userController.getMe);
router.put("/me", authenticate, userController.updateProfile);
router.put("/me/password", authenticate, userController.updatePassword);
router.get("/me/sessions", authenticate, userController.getUserSessions);
router.delete("/me/sessions/all", authenticate, userController.invalidateAllSessions);
router.delete("/me/sessions/:sessionId", authenticate, userController.invalidateSession);

// Rutas admin para gestionar usuarios (requieren autorización)
router.get("/users", authenticate, authorize(['admin']), userController.getUsers);
router.get("/users/search", authenticate, authorize(['admin']), userController.searchUsers);
router.get("/:id/roles", authenticate, authorize(['admin']), userController.getUserRoles);
router.post("/:id/roles", authenticate, authorize(['admin']), userController.assignRole);
router.delete("/:id/roles/:roleIdentifier", authenticate, authorize(['admin']), userController.removeRole);

export default router;
// routes/sessionRoutes.js
import express from "express";
import sessionController from "../controllers/sessionController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// 1. Crear sesión (normalmente desde login)
router.post("/", authenticate, sessionController.createSession);

// 2. Obtener sesiones del usuario autenticado
router.get("/", authenticate, sessionController.getUserSessions);

// 3. Obtener sesiones de un usuario específico (admin)
router.get("/user/:userId", authenticate, sessionController.getAllSessionsByUser);

// 4. Obtener sesiones activas de un usuario específico (admin)
router.get("/user/:userId/active", authenticate, sessionController.getActiveSessionsByUser);

// 5. Invalidar una sesión específica
router.delete("/:sessionId", authenticate, sessionController.invalidateSession);

// 6. Invalidar otras sesiones (excepto la actual)
router.delete("/user/others", authenticate, sessionController.invalidateOtherSessions);

// 7. Invalidar todas las sesiones del usuario
router.delete("/user/all", authenticate, async (req, res) => {
    // Necesitarías crear este método en el controller o usar directamente
    try {
        const userId = req.user.id;
        await sessionService.invalidateAllForUser(userId);
        res.status(200).json({
            ok: true,
            message: "All sessions invalidated successfully"
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            message: err.message
        });
    }
});

// 8. Eliminar completamente una sesión
router.delete("/:sessionId/delete", authenticate, sessionController.deleteSession);

export default router;
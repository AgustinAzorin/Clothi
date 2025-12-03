// routes/sessionRoutes.js
import express from "express";
import sessionController from "../controllers/sessionController.js";
import authenticate from "../middlewares/authenticate.js";
import sessionService from "../services/sessionService.js";

const router = express.Router();

// 1. Crear sesión (útil para admin crear sesiones manualmente)
router.post("/", authenticate, sessionController.createSession);

// 2. Obtener sesiones del usuario autenticado
router.get("/", authenticate, sessionController.getUserSessions);

// 3. Obtener TODAS las sesiones de un usuario específico (admin)
router.get("/user/:userId", authenticate, sessionController.getAllSessionsByUser);

// 4. Obtener sesiones activas de un usuario específico (admin)
router.get("/user/:userId/active", authenticate, sessionController.getActiveSessionsByUser);

// 5. Invalidar una sesión específica
router.delete("/:sessionId", authenticate, sessionController.invalidateSession);

// 6. Invalidar otras sesiones (excepto la actual)
router.post("/invalidate-others", authenticate, sessionController.invalidateOtherSessions);

// 7. Invalidar TODAS las sesiones del usuario
router.delete("/user/all", authenticate, async (req, res) => {
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

// 8. Eliminar completamente una sesión de la BD
router.delete("/:sessionId/delete", authenticate, sessionController.deleteSession);

// 9. Verificar si una sesión es válida
router.get("/:sessionId/check", authenticate, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const isValid = await sessionService.checkSessionValidity(sessionId);
        res.status(200).json({
            ok: true,
            isValid
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            message: err.message
        });
    }
});

export default router;
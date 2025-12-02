// src/controllers/sessionController.js
import sessionService from'../services/sessionService.js';

class SessionController {

    // Registrar una nueva sesión
    async createSession(req, res) {
        try {
            const { userId, device, ipAddress, userAgent } = req.body;

            const session = await sessionService.createSession({
                userId,
                device,
                ipAddress,
                userAgent
            });

            res.status(201).json({
                ok: true,
                message: "Session created successfully",
                session
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error creating session"
            });
        }
    }

    // Invalidar sesión (logout)
    async invalidateSession(req, res) {
        try {
            const { sessionId } = req.params;

            await sessionService.invalidateSession(sessionId);

            res.status(200).json({
                ok: true,
                message: "Session invalidated successfully"
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error invalidating session"
            });
        }
    }

    // Obtener todas las sesiones activas de un usuario
    async getActiveSessionsByUser(req, res) {
        try {
            const { userId } = req.params;

            const sessions = await sessionService.getActiveSessionsByUser(userId);

            res.status(200).json({
                ok: true,
                sessions
            });

        } catch (err) {
            res.status(500).json({
                ok: false,
                message: err.message || "Error fetching sessions"
            });
        }
    }

    // Invalidar todas las sesiones excepto la actual
    async invalidateOtherSessions(req, res) {
        try {
            const { userId, currentSessionId } = req.body;

            await sessionService.invalidateOtherSessions(userId, currentSessionId);

            res.status(200).json({
                ok: true,
                message: "Other sessions invalidated successfully"
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error invalidating other sessions"
            });
        }
    }

    // Eliminar completamente una sesión (no solo invalidarla)
    async deleteSession(req, res) {
        try {
            const { sessionId } = req.params;

            await sessionService.deleteSession(sessionId);

            res.status(200).json({
                ok: true,
                message: "Session deleted successfully"
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error deleting session"
            });
        }
    }

    // Obtener TODAS las sesiones de un usuario (activas e inválidas)
    async getAllSessionsByUser(req, res) {
        try {
            const { userId } = req.params;

            const sessions = await sessionService.getAllSessionsByUser(userId);

            res.status(200).json({
                ok: true,
                sessions
            });

        } catch (err) {
            res.status(500).json({
                ok: false,
                message: err.message || "Error fetching sessions"
            });
        }
    }
    // Obtener las sesiones del usuario autenticado
    async getUserSessions(req, res) {
        try {
            const userId = req.user.id; // viene del middleware authenticate

            const sessions = await sessionService.getActiveSessionsByUser(userId);

            res.status(200).json({
                ok: true,
                sessions
            });

        } catch (err) {
            res.status(500).json({
                ok: false,
                message: err.message || "Error fetching user sessions"
            });
        }
    }
}

export default new SessionController();


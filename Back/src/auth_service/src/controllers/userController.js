// src/controllers/userController.js
import userService from "../services/userService.js";
import sessionService from "../services/sessionService.js";

class UserController {
    /**
     * GET /me
     * Obtiene el perfil del usuario autenticado
     */
    async getMe(req, res) {
        try {
            const user = await userService.getUserById(req.user.id);
            res.json(user);
        } catch (err) {
            const status = err.status || 500;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * PUT /me
     * Actualiza el perfil propio
     */
    async updateProfile(req, res) {
        try {
            const updatedProfile = await userService.updateUser(req.user.id, req.body);
            res.json({
                ok: true,
                data: updatedProfile
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * PUT /me/password
     * Cambiar contraseña
     */
    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            
            if (!oldPassword || !newPassword) {
                throw new Error("Old password and new password are required");
            }

            const result = await userService.updatePassword(
                req.user.id,
                oldPassword,
                newPassword
            );
            
            res.json({
                ok: true,
                message: "Password updated successfully"
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * GET /:id/roles
     */
    async getUserRoles(req, res) {
        try {
            const roles = await userService.getUserRoles(req.params.id);
            res.json({
                ok: true,
                data: roles
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * POST /:id/roles
     */
    async assignRole(req, res) {
        try {
            const { role } = req.body; // Ahora puede ser roleId o roleName
            
            if (!role) {
                throw new Error("Role is required");
            }

            const result = await userService.assignRole(req.params.id, role);
            res.json({
                ok: true,
                data: result
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * DELETE /:id/roles/:roleIdentifier
     * roleIdentifier puede ser ID o nombre
     */
    async removeRole(req, res) {
        try {
            const { roleIdentifier } = req.params;
            const result = await userService.removeRole(req.params.id, roleIdentifier);
            res.json({
                ok: true,
                data: result
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * GET /me/sessions
     */
    async getUserSessions(req, res) {
        try {
            // Usar getUserSessions o getActiveSessionsByUser según lo que tengas
            const sessions = await sessionService.getUserSessions(req.user.id);
            res.json({
                ok: true,
                data: sessions
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * DELETE /me/sessions/:sessionId
     */
    async invalidateSession(req, res) {
        try {
            await sessionService.invalidateSession(req.params.sessionId);
            res.json({
                ok: true,
                message: "Session invalidated successfully"
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * DELETE /me/sessions/all
     * Invalidar todas las sesiones del usuario
     */
    async invalidateAllSessions(req, res) {
        try {
            await sessionService.invalidateAllForUser(req.user.id);
            res.json({
                ok: true,
                message: "All sessions invalidated successfully"
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * GET /users
     * Listar usuarios (admin)
     */
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 20, role } = req.query;
            const result = await userService.getAllUsers({ page, limit, role });
            res.json({
                ok: true,
                data: result
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    /**
     * GET /users/search
     * Buscar usuarios
     */
    async searchUsers(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                throw new Error("Search query is required");
            }
            
            const users = await userService.searchUsers(q);
            res.json({
                ok: true,
                data: users
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }
}

export default new UserController();
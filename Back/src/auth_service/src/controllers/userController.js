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
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /me
   * Actualiza el perfil propio
   */
  async updateProfile(req, res) {
    try {
      const updatedProfile = await userService.updateUser(req.user.id, req.body);
      res.json(updatedProfile);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * PUT /me/password
   * Cambiar contraseña
   */
  async updatePassword(req, res) {
    try {
      const result = await userService.updatePassword(
        req.user.id,
        req.body.oldPassword,
        req.body.newPassword
      );
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * GET /:id/roles
   */
  async getUserRoles(req, res) {
    try {
      const roles = await userService.getUserRoles(req.params.id);
      res.json(roles);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * POST /:id/roles
   */
  async assignRole(req, res) {
    try {
      const { roleId } = req.body;
      const result = await userService.assignRole(req.params.id, roleId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * DELETE /:id/roles/:roleId
   */
  async removeRole(req, res) {
    try {
      const result = await userService.removeRole(req.params.id, req.params.roleId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * GET /me/sessions
   */
  async getUserSessions(req, res) {
    try {
      const sessions = await sessionService.getSessionsByUser(req.user.id);
      res.json(sessions);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * DELETE /me/sessions/:sessionId
   */
  async invalidateSession(req, res) {
    try {
      await sessionService.invalidateSession(req.user.id, req.params.sessionId);
      res.json({ message: "Session invalidated" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new UserController();

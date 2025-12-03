// src/services/sessionService.js
import sessionRepository from "../repositories/sessionRepository.js";

class SessionService {
    // Registrar una sesión nueva (login)
    async createSession({ userId, device, ipAddress, userAgent }) {
        return await sessionRepository.create({
            user_id: userId,
            device,
            ip_address: ipAddress,
            user_agent: userAgent
        });
    }

    // Obtener todas las sesiones activas del usuario
    async getActiveSessionsByUser(userId) {
        return await sessionRepository.findActiveByUserId(userId);
    }

    // Invalidar una sesión particular
    async invalidateSession(sessionId) {
        return await sessionRepository.invalidate(sessionId);
    }

    // Invalidar todas las sesiones del usuario
    async invalidateAllForUser(userId) {
        return await sessionRepository.invalidateAll(userId);
    }

    // Obtener TODAS las sesiones (activas e inactivas)
    async getAllSessionsByUser(userId) {
        return await sessionRepository.findAllByUserId(userId);
    }

    // Invalidar todas las sesiones excepto la actual
    async invalidateOtherSessions(userId, currentSessionId) {
        return await sessionRepository.invalidateOtherSessions(userId, currentSessionId);
    }

    // Eliminar completamente una sesión de la BD
    async deleteSession(sessionId) {
        return await sessionRepository.delete(sessionId);
    }

    // Alias para compatibilidad
    async getUserSessions(userId) {
        return await this.getActiveSessionsByUser(userId);
    }
}

export default new SessionService();
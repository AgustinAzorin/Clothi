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
    async getUserSessions(userId) {
        return await sessionRepository.findActiveByUserId(userId);
    }

    // Invalidar una sesión particular
    async invalidateSession(sessionId) {
        return await sessionRepository.invalidate(sessionId);
    }

    // Invalidar todas las sesiones del usuario (ej: cambio de contraseña)
    async invalidateAllForUser(userId) {
        return await sessionRepository.invalidateAll(userId);
    }
}

export default new SessionService();

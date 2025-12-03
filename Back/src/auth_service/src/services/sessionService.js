// src/services/sessionService.js
import sessionRepository from "../repositories/sessionRepository.js";

class SessionService {
    async createSession({ userId, device, ipAddress, userAgent }) {
    return await sessionRepository.create({
        user_id: userId,
        device: device || 'unknown',
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent || 'unknown',
        is_valid: true,
        invalidated_at: null
    });
}

    async getActiveSessionsByUser(userId) {
        return await sessionRepository.findActiveByUserId(userId);
    }

    async invalidateSession(sessionId) {
        return await sessionRepository.invalidate(sessionId);
    }

    async invalidateAllForUser(userId) {
        return await sessionRepository.invalidateAll(userId);
    }

    async getAllSessionsByUser(userId) {
        return await sessionRepository.findAllByUserId(userId);
    }

    async invalidateOtherSessions(userId, currentSessionId) {
        return await sessionRepository.invalidateOtherSessions(userId, currentSessionId);
    }

    async deleteSession(sessionId) {
        return await sessionRepository.delete(sessionId);
    }

    async getUserSessions(userId) {
        return await this.getActiveSessionsByUser(userId);
    }

    // Métodos adicionales útiles
    async getSessionById(sessionId) {
        return await sessionRepository.findById(sessionId);
    }

    async checkSessionValidity(sessionId) {
        return await sessionRepository.isValidSession(sessionId);
    }
}

export default new SessionService();
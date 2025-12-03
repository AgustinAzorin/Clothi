// src/repositories/sessionRepository.js

import Session from "../models/session.js";
import { Op } from "sequelize";

class SessionRepository {

    // Crear sesión
    async create(data) {
        return await Session.create(data);
    }

    // Buscar sesiones activas por user_id
    async findActiveByUserId(userId) {
        return await Session.findAll({
            where: {
                user_id: userId,
                is_valid: true
            }
        });
    }

    // Invalida una sesión
    async invalidate(sessionId) {
        return await Session.update(
            {
                is_valid: false,
                invalidated_at: new Date()
            },
            { where: { id: sessionId } }
        );
    }

    // Invalidar todas las sesiones de un usuario
    async invalidateAll(userId) {
        return await Session.update(
            {
                is_valid: false,
                invalidated_at: new Date()
            },
            {
                where: {
                    user_id: userId,
                    is_valid: true
                }
            }
        );
    }
        // Obtener todas las sesiones (activas e inactivas)
    async findAllByUserId(userId) {
        return await db.query(
            'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
    }

    // Invalidar otras sesiones excepto la actual
    async invalidateOtherSessions(userId, currentSessionId) {
        return await db.query(
            'UPDATE sessions SET is_valid = false WHERE user_id = $1 AND id != $2 AND is_valid = true',
            [userId, currentSessionId]
        );
    }

    // Eliminar completamente una sesión
    async delete(sessionId) {
        return await db.query(
            'DELETE FROM sessions WHERE id = $1',
            [sessionId]
        );
    }
}

export default new SessionRepository();

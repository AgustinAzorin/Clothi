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
}

export default new SessionRepository();

// src/repositories/sessionRepository.js
import Session from '../models/Session.js';
import { Op } from 'sequelize';

class SessionRepository {
    
    // Crear nueva sesión
    async create(sessionData) {
        try {
            const session = await Session.create({
                id: sessionData.id || uuidv4(), // Asumiendo que usas UUID
                user_id: sessionData.user_id,
                device: sessionData.device,
                ip_address: sessionData.ip_address,
                user_agent: sessionData.user_agent,
                is_valid: true,
                invalidated_at: null
            });
            return session;
        } catch (error) {
            throw new Error(`Error creating session: ${error.message}`);
        }
    }

    // Obtener sesiones activas por usuario
    async findActiveByUserId(userId) {
        try {
            const sessions = await Session.findAll({
                where: {
                    user_id: userId,
                    is_valid: true
                },
                order: [['created_at', 'DESC']]
            });
            return sessions;
        } catch (error) {
            throw new Error(`Error finding active sessions: ${error.message}`);
        }
    }

    // Obtener TODAS las sesiones por usuario (activas e inactivas)
    async findAllByUserId(userId) {
        try {
            const sessions = await Session.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
            return sessions;
        } catch (error) {
            throw new Error(`Error finding all sessions: ${error.message}`);
        }
    }

    // Invalidar una sesión específica
    async invalidate(sessionId) {
        try {
            const session = await Session.findByPk(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            
            session.is_valid = false;
            session.invalidated_at = new Date();
            await session.save();
            
            return session;
        } catch (error) {
            throw new Error(`Error invalidating session: ${error.message}`);
        }
    }

    // Invalidar todas las sesiones de un usuario
    async invalidateAll(userId) {
        try {
            const [updatedCount] = await Session.update(
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
            
            return updatedCount;
        } catch (error) {
            throw new Error(`Error invalidating all sessions: ${error.message}`);
        }
    }

    // Invalidar todas las sesiones excepto la actual
    async invalidateOtherSessions(userId, currentSessionId) {
        try {
            const [updatedCount] = await Session.update(
                {
                    is_valid: false,
                    invalidated_at: new Date()
                },
                {
                    where: {
                        user_id: userId,
                        id: { [Op.ne]: currentSessionId }, // Op.ne = not equal
                        is_valid: true
                    }
                }
            );
            
            return updatedCount;
        } catch (error) {
            throw new Error(`Error invalidating other sessions: ${error.message}`);
        }
    }

    // Eliminar completamente una sesión
    async delete(sessionId) {
        try {
            const deletedCount = await Session.destroy({
                where: { id: sessionId }
            });
            
            if (deletedCount === 0) {
                throw new Error('Session not found');
            }
            
            return deletedCount;
        } catch (error) {
            throw new Error(`Error deleting session: ${error.message}`);
        }
    }

    // Buscar sesión por ID
    async findById(sessionId) {
        try {
            const session = await Session.findByPk(sessionId);
            return session;
        } catch (error) {
            throw new Error(`Error finding session by ID: ${error.message}`);
        }
    }

    // Verificar si una sesión es válida
    async isValidSession(sessionId) {
        try {
            const session = await Session.findOne({
                where: {
                    id: sessionId,
                    is_valid: true
                }
            });
            return !!session;
        } catch (error) {
            throw new Error(`Error checking session validity: ${error.message}`);
        }
    }
}

export default new SessionRepository();
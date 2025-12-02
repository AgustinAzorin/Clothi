// src/services/authService.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

import userService from './userService.js';
import sessionService from './sessionService.js';

class AuthService {

    // Crear un usuario desde cero
    async signup(data) {
        const user = await userService.createUser(data);
        return user;
    }

    // Login y generación de tokens
    async login({ email, password, device, ip, userAgent }) {
        // 1. Validar credenciales
        const user = await userService.validateCredentials(email, password);

        // 2. Generar tokens
        const accessToken = this.generateAccessToken({ userId: user.id });
        const refreshToken = this.generateRefreshToken({ userId: user.id });

        // 3. Guardar refresh token en Redis
        await redisClient.set(
            `refresh:${user.id}`,
            refreshToken,
            { EX: 60 * 60 * 24 * 7 } // 7 días
        );

        // 4. Registrar sesión
        await sessionService.createSession({
            userId: user.id,
            device,
            ipAddress: ip,
            userAgent
        });

        return {
            userId: user.id,
            accessToken,
            refreshToken
        };
    }

    // Logout (invalidar refresh token y sesión)
    async logout({ userId, sessionId }) {
        // invalidar refresh en Redis
        await redisClient.del(`refresh:${userId}`);

        // invalidar sesión
        if (sessionId) {
            await sessionService.invalidateSession(sessionId);
        }

        return { message: "Logged out successfully" };
    }

    // Validar access token (middleware lo usa)
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (err) {
            const error = new Error("Invalid or expired token");
            error.status = 401;
            throw error;
        }
    }

    // Rotar refresh token → generar uno nuevo
    async refreshToken(oldRefreshToken) {
        let decoded;

        try {
            decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            const error = new Error("Invalid refresh token");
            error.status = 401;
            throw error;
        }

        const stored = await redisClient.get(`refresh:${decoded.userId}`);

        if (!stored || stored !== oldRefreshToken) {
            const error = new Error("Refresh token expired or invalidated");
            error.status = 401;
            throw error;
        }

        // rotar token → crear uno nuevo
        const newRefreshToken = this.generateRefreshToken({ userId: decoded.userId });
        const newAccessToken = this.generateAccessToken({ userId: decoded.userId });

        // reemplazar en redis
        await redisClient.set(
            `refresh:${decoded.userId}`,
            newRefreshToken,
            { EX: 60 * 60 * 24 * 7 }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    // ================================
    // TOKEN GENERATION
    // ================================
    generateAccessToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "15m"
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d"
        });
    }
}

export default new AuthService();

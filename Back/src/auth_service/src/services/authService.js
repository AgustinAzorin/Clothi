// src/services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import redisClient from '../config/redis.js';
import nodemailer from 'nodemailer'; // Necesitarás instalar nodemailer

import userService from './userService.js';
import sessionService from './sessionService.js';

class AuthService {
    // Crear un usuario desde cero
    async signup(data) {
        const user = await userService.createUser(data);
        return user;
    }

    // Login y generación de tokens
    async login(email, password, agent = {}) {
        // 1. Validar credenciales
        const user = await userService.validateCredentials(email, password);

        // 2. Generar tokens
        const accessToken = this.generateAccessToken({ 
            userId: user.id,
            email: user.email 
        });
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
            device: agent.device || 'unknown',
            ipAddress: agent.ip || req?.ip || 'unknown',
            userAgent: agent.ua || agent.userAgent || 'unknown'
        });

        return {
            userId: user.id,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email
            }
        };
    }

    // Logout (invalidar refresh token y sesión)
    async logout(userId, token, sessionId = null) {
        // Invalidar refresh token en Redis
        await redisClient.del(`refresh:${userId}`);

        // Invalidar sesión si se proporciona sessionId
        if (sessionId) {
            await sessionService.invalidateSession(sessionId);
        } else {
            // Buscar y invalidar la sesión actual basada en el token
            // Esto requiere que tengas una forma de relacionar token con sessionId
            // Por ahora invalidamos todas las sesiones del usuario para seguridad
            await sessionService.invalidateAllForUser(userId);
        }

        // También podrías añadir el token a una blacklist
        const tokenKey = `blacklist:${token}`;
        await redisClient.set(tokenKey, '1', { EX: 3600 }); // 1 hora

        return { message: "Logged out successfully" };
    }

    // Refresh token
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

        // Generar nuevos tokens
        const user = await userService.getUserById(decoded.userId);
        const newRefreshToken = this.generateRefreshToken({ userId: decoded.userId });
        const newAccessToken = this.generateAccessToken({ 
            userId: decoded.userId,
            email: user.email 
        });

        // Reemplazar en redis
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

    // Forgot password
    async forgotPassword(email) {
        const user = await userService.getUserByEmail(email); // Necesitas este método
        if (!user) {
            // Por seguridad, no revelamos si el email existe
            return { message: "If the email exists, a reset link will be sent" };
        }

        // Generar token de reseteo
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Guardar token en Redis (expira en 1 hora)
        await redisClient.set(
            `password_reset:${resetTokenHash}`,
            user.id,
            { EX: 3600 }
        );

        // Enviar email (configura tu transporte de email)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        await this.sendPasswordResetEmail(user.email, resetUrl);

        return { message: "Password reset email sent" };
    }

    // Reset password
    async resetPassword(token, newPassword) {
        // Hashear el token recibido
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Verificar token en Redis
        const userId = await redisClient.get(`password_reset:${resetTokenHash}`);
        if (!userId) {
            const error = new Error("Invalid or expired reset token");
            error.status = 400;
            throw error;
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userService.updateUser(userId, { password: hashedPassword });

        // Invalidar token usado
        await redisClient.del(`password_reset:${resetTokenHash}`);

        // Invalidar todas las sesiones del usuario
        await sessionService.invalidateAllForUser(userId);

        return { message: "Password updated successfully" };
    }

    // Verificar access token
    verifyAccessToken(token) {
        try {
            // Verificar si está en la blacklist
            // Esto requeriría chequear Redis en cada verificación
            // Podrías optimizar cacheando en memoria por un tiempo corto
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (err) {
            const error = new Error("Invalid or expired token");
            error.status = 401;
            throw error;
        }
    }

    // Verificar si token está blacklisted
    async isTokenBlacklisted(token) {
        const blacklisted = await redisClient.get(`blacklist:${token}`);
        return !!blacklisted;
    }

    // ================================
    // HELPER METHODS
    // ================================

    generateAccessToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
            issuer: process.env.JWT_ISSUER || "auth-service"
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
            issuer: process.env.JWT_ISSUER || "auth-service"
        });
    }

    async sendPasswordResetEmail(email, resetUrl) {
        // Configurar transporte de email según tu proveedor
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Reset Your Password',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    }
}

export default new AuthService();
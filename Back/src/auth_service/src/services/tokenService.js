// src/services/tokenService.js (versión mínima)
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

export default {
    // Solo los métodos que necesita el middleware
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (err) {
            const error = new Error("Invalid or expired token");
            error.status = 401;
            throw error;
        }
    },

    async isTokenBlacklisted(token) {
        const blacklisted = await redisClient.get(`blacklist:${token}`);
        return !!blacklisted;
    }
};
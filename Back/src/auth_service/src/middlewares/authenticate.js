// middlewares/authenticate.js
import jwt from "jsonwebtoken";
import authService from "../services/authService.js";
import redisClient from "../config/redis.js";
import tokenService from "../services/tokenService.js";

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                ok: false,
                error: "No token provided" 
            });
        }

        const token = authHeader.split(" ")[1];
        
        // Guardar token en request para logout
        req.token = token;

        // Verificar si el token está blacklisted
        const isBlacklisted = await tokenService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({ 
                ok: false,
                error: "Token has been invalidated" 
            });
        }

        // Verificar y decodificar token
        const decoded = tokenService.verifyAccessToken(token);
        
        // Añadir información del usuario al request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            ...decoded
        };

        next();
    } catch (err) {
        return res.status(401).json({ 
            ok: false,
            error: err.message || "Invalid or expired token"
        });
    }
};
// src/controllers/authController.js
import authService from "../services/authService.js";

class AuthController {
    // SIGNUP
    async signup(req, res) {
        try {
            const result = await authService.signup(req.body);
            res.status(201).json({
                ok: true,
                message: "User created successfully",
                data: result
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // LOGIN
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                throw new Error("Email and password are required");
            }

            const agent = {
                device: req.headers['user-device'] || 'unknown',
                ip: req.ip,
                ua: req.headers['user-agent']
            };

            const tokens = await authService.login(email, password, agent);
            
            // Opcional: Setear cookies
            if (req.cookies) {
                res.cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
                });
            }

            res.json({
                ok: true,
                message: "Login successful",
                data: tokens
            });
        } catch (err) {
            const status = err.status || 401;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // FORGOT PASSWORD
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                throw new Error("Email is required");
            }

            await authService.forgotPassword(email);

            res.json({ 
                ok: true,
                message: "If the email exists, a password reset link will be sent" 
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // RESET PASSWORD
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            
            if (!token || !newPassword) {
                throw new Error("Token and new password are required");
            }

            await authService.resetPassword(token, newPassword);

            res.json({ 
                ok: true,
                message: "Password updated successfully" 
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // REFRESH TOKEN
    async refreshToken(req, res) {
        try {
            const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
            
            if (!refreshToken) {
                throw new Error("Refresh token is required");
            }

            const tokens = await authService.refreshToken(refreshToken);

            res.json({
                ok: true,
                message: "Token refreshed successfully",
                data: tokens
            });
        } catch (err) {
            const status = err.status || 401;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // LOGOUT
    async logout(req, res) {
        try {
            const userId = req.user?.userId || req.user?.sub;
            const token = req.token; // viene del middleware authenticate actualizado
            
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await authService.logout(userId, token);

            // Limpiar cookies si existen
            if (req.cookies?.refreshToken) {
                res.clearCookie('refreshToken');
            }

            res.json({ 
                ok: true,
                message: "Logged out successfully" 
            });
        } catch (err) {
            const status = err.status || 400;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }

    // VERIFY TOKEN (endpoint para verificar token válido)
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            
            if (!token) {
                throw new Error("Token is required");
            }

            const decoded = authService.verifyAccessToken(token);
            const isBlacklisted = await authService.isTokenBlacklisted(token);
            
            if (isBlacklisted) {
                throw new Error("Token has been invalidated");
            }

            res.json({
                ok: true,
                message: "Token is valid",
                data: decoded
            });
        } catch (err) {
            const status = err.status || 401;
            res.status(status).json({ 
                ok: false, 
                error: err.message 
            });
        }
    }
}

export default new AuthController();
// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// Public endpoints
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh", authController.refreshToken);
router.post("/verify", authController.verifyToken); // Nuevo endpoint

// Protected endpoints (requieren autenticación)
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, (req, res) => {
    // Endpoint de ejemplo que devuelve info del usuario autenticado
    res.json({
        ok: true,
        data: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

export default router;
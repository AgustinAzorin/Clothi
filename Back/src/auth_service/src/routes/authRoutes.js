// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// Public
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh", authController.refreshToken);

// Protected
router.post("/logout", authenticate, authController.logout);

export default router;

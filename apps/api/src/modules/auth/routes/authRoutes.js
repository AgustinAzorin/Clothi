const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validate } = require('../validators/authValidator');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/authValidator');
const { authenticate } = require('../../../middleware/auth');

// Rutas públicas
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/check-username/:username', AuthController.checkUsername);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.post('/logout', authenticate, AuthController.logout);
router.post('/become-seller', authenticate, AuthController.becomeSeller);

// Ruta para verificar token (health check de autenticación)
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
import authService from "../services/authService.js";

class AuthController {
  // SIGNUP
  async signup(req, res) {
    try {
      const user = await authService.signup(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // LOGIN
  async login(req, res) {
    try {
      const agent = {
        ua: req.headers["user-agent"],
        ip: req.ip
      };

      const tokens = await authService.login(
        req.body.email,
        req.body.password,
        agent
      );

      res.json(tokens);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  // FORGOT PASSWORD
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.json({ message: "Recovery email sent" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // RESET PASSWORD
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // REFRESH TOKEN
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      res.json(tokens);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  // LOGOUT
  async logout(req, res) {
    try {
      const userId = req.user.id;
      const token = req.token; // viene desde authenticate middleware

      await authService.logout(userId, token);

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new AuthController();

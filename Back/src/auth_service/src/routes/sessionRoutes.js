// routes/sessionRoutes.js
import express from "express";
import sessionController from "../controllers/sessionController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/", authenticate, sessionController.getUserSessions);
router.delete("/:sessionId", authenticate, sessionController.invalidateSession);

export default router;

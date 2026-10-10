import { Router } from "express";
import {
  register,
  login,
  getMe,
  verifyActivationToken,
  setPasswordAndActivate,
  requestPasswordReset,
  verifyResetToken,
  resetPasswordWithToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public auth routes
router.post("/register", register);
router.get("/verify-token", verifyActivationToken);
router.post("/set-password", setPasswordAndActivate);
router.post("/forgot-password", requestPasswordReset);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPasswordWithToken);
router.post("/login", login);

// Protected profile route
router.get("/me", protect, getMe);

export default router;

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { sendActivationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../services/emailServiceClient.js";

/**
 * Request Password Reset Email
 * POST /api/v1/auth/forgot-password
 */
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Please provide your registered work email address.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid work email address.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "This email address is not registered. Please check your email or register a new account.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        error: "This account has been deactivated. Please contact your system administrator.",
      });
    }

    // Generate 32-byte secure random reset token
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawResetToken);
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${rawResetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Dispatch password reset email via Email Service
    sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetLink,
    }).catch((err) => {
      console.warn("[Loan CRM Backend] Non-blocking password reset email dispatch warning:", err);
    });

    return res.json({
      success: true,
      message: "Password reset link has been sent to your registered email address.",
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Request password reset error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process password reset request.",
    });
  }
}

/**
 * Verify Reset Token validity
 * GET /api/v1/auth/verify-reset-token
 */
export async function verifyResetToken(req, res) {
  try {
    const { token, email } = req.query ?? {};

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: "Reset token and email address are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedToken = hashToken(String(token));

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Password reset link is invalid, expired, or has already been used.",
      });
    }

    return res.json({
      success: true,
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Verify reset token error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error verifying reset token.",
    });
  }
}

/**
 * Reset Password using token
 * POST /api/v1/auth/reset-password
 */
export async function resetPasswordWithToken(req, res) {
  try {
    const { token, email, password, newPassword } = req.body ?? {};
    const targetPassword = password || newPassword;

    if (!token || !email || !targetPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token, email, and new password are required.",
      });
    }

    if (String(targetPassword).length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedToken = hashToken(String(token));

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Password reset link is invalid, expired, or has already been used.",
      });
    }

    // Hash & update password, set status to active if pending, clear reset token
    user.password = String(targetPassword);
    if (user.status === "pending") {
      user.status = "active";
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log(`[Loan CRM Backend] Password successfully reset for user ${user.email}`);

    return res.json({
      success: true,
      message: "Your password has been updated successfully. You can now log in using your new password.",
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset password.",
    });
  }
}

function generateToken(id) {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

const PERMITTED_ROLES = ["admin", "sales", "processing", "viewer"];

const DEFAULT_TITLES = {
  admin: { title: "Founder & Managing Director", dept: "Executive Management" },
  sales: { title: "Senior Tele-Calling & Sales Exec", dept: "Sales & Lead Gen" },
  processing: { title: "Lead Loan Processing Officer", dept: "Credit & Bank Operations" },
  viewer: { title: "External Auditor / Operations Viewer", dept: "Audit & Compliance" },
};

/**
 * Initiate Account Registration & Dispatch Activation Email
 * POST /api/v1/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, role, roleTitle, department, mobile } = req.body ?? {};

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Full name and work email address are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid work email address.",
      });
    }

    const selectedRole = role && PERMITTED_ROLES.includes(role) ? role : "sales";

    // Check if account already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(409).json({
          success: false,
          error: "An active account with this email address already exists.",
        });
      }
    }

    // Generate 32-byte activation token
    const rawActivationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawActivationToken);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userRoleTitle = roleTitle || DEFAULT_TITLES[selectedRole]?.title || "";
    const userDepartment = department || DEFAULT_TITLES[selectedRole]?.dept || "";

    let user;
    if (existingUser && existingUser.status === "pending") {
      // Re-use existing pending registration record and update token
      existingUser.name = name;
      existingUser.role = selectedRole;
      existingUser.roleTitle = userRoleTitle;
      existingUser.department = userDepartment;
      existingUser.mobile = mobile || existingUser.mobile || "";
      existingUser.activationToken = hashedToken;
      existingUser.activationTokenExpires = tokenExpires;
      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        role: selectedRole,
        roleTitle: userRoleTitle,
        department: userDepartment,
        mobile: mobile || "",
        status: "pending",
        activationToken: hashedToken,
        activationTokenExpires: tokenExpires,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${frontendUrl}/set-password?token=${rawActivationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Dispatch activation email via Email Service microservice
    const emailResult = await sendActivationEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      activationLink,
    });

    if (!emailResult.success) {
      console.warn(`[Loan CRM Backend] Activation email sending warning: ${emailResult.error}`);
    }

    return res.status(201).json({
      success: true,
      message: "Account registration initiated successfully",
      email: user.email,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Register error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate registration",
    });
  }
}

/**
 * Verify Activation Token validity
 * GET /api/v1/auth/verify-token
 */
export async function verifyActivationToken(req, res) {
  try {
    const { token, email } = req.query ?? {};

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: "Activation token and email are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedToken = hashToken(String(token));

    const user = await User.findOne({
      email: normalizedEmail,
      status: "pending",
      activationToken: hashedToken,
      activationTokenExpires: { $gt: new Date() },
    }).select("+activationToken +activationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Activation link is invalid, expired, or has already been used.",
      });
    }

    return res.json({
      success: true,
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Verify token error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error verifying token",
    });
  }
}

/**
 * Set Password & Activate Pending User Account
 * POST /api/v1/auth/set-password
 */
export async function setPasswordAndActivate(req, res) {
  try {
    const { token, email, password } = req.body ?? {};

    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Activation token, email, and new password are required.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashedToken = hashToken(String(token));

    const user = await User.findOne({
      email: normalizedEmail,
      status: "pending",
      activationToken: hashedToken,
      activationTokenExpires: { $gt: new Date() },
    }).select("+activationToken +activationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Activation link is invalid, expired, or has already been used.",
      });
    }

    // Set new password, activate account, and invalidate token
    user.password = String(password);
    user.status = "active";
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;

    await user.save();

    console.log(`[Loan CRM Backend] User account activated for ${user.email}`);

    return res.json({
      success: true,
      message: "Your password has been set successfully. You can now log in.",
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Set password error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to set password",
    });
  }
}

/**
 * Login user into Loan CRM
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide work email and password.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email credentials.",
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        error: "Account registration is pending. Please complete password setup using the link sent to your email.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        error: "Your user account is inactive. Please contact system administrator.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid password credentials.",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: user.roleTitle,
        department: user.department,
        mobile: user.mobile,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("[Loan CRM Backend] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during login",
    });
  }
}

/**
 * Get current logged-in user profile
 * GET /api/v1/auth/me
 */
export async function getMe(req, res) {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      roleTitle: req.user.roleTitle,
      department: req.user.department,
      mobile: req.user.mobile,
      status: req.user.status,
      createdAt: req.user.createdAt,
    },
  });
}

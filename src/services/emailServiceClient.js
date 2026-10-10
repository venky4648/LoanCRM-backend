import { env } from "../config/env.js";

/**
 * Sends a Password Reset Email via Loan CRM Email Service
 */
export async function sendPasswordResetEmail({ email, name, resetLink }) {
  const emailServiceUrl = env.EMAIL_SERVICE_URL || "http://127.0.0.1:4008";
  const serviceAuthToken = env.SERVICE_AUTH_TOKEN || "8f4b27a91c5e4d31b0d7f4e8a2c91f3d7e5a4b1c9d2e3f6a";

  const subject = "Reset Your Normiloans CRM Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #F26500; margin: 0; font-size: 22px;">Normiloans CRM</h2>
        <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Education Loan Lead-to-Disbursement Platform</p>
      </div>

      <p style="font-size: 15px; color: #0F2237; line-height: 1.6;">Hi <strong>${name || "there"}</strong>,</p>

      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        We received a request to reset your Normiloans CRM account password. Click the button below to choose a new password:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #F26500; color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 30px; box-shadow: 0 4px 12px rgba(242, 101, 0, 0.25);">
          Reset Password &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #64748B; line-height: 1.5; background-color: #F8FAFC; padding: 12px; border-radius: 6px; border-left: 3px solid #F26500;">
        <strong>Security Notice:</strong> For your security, this link will expire in 1 hour and can only be used once. If you did not initiate this request, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
        Normiloans CRM · Hyderabad, Telangana<br />
        This is an automated security notification.
      </p>
    </div>
  `;

  const text = `Hi ${name || "there"},\n\nWe received a request to reset your Normiloans CRM account password (${email}).\n\nPlease reset your password using this link:\n${resetLink}\n\nThis link expires in 1 hour. If you did not request a password reset, please ignore this email.\n\nNormiloans CRM`;

  try {
    const res = await fetch(`${emailServiceUrl}/api/v1/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Auth": serviceAuthToken,
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        text,
        senderName: "Normiloans Security Team",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("[Loan CRM Backend] Email Service returned non-200 for reset email:", data);
      return { success: false, error: data.error || "Email service error" };
    }

    console.log(`[Loan CRM Backend] Password reset email sent to ${email} (MessageID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[Loan CRM Backend] Reset email dispatch failed: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Sends an Account Activation & Password Setup Email via Loan CRM Email Service
 */
export async function sendActivationEmail({ email, name, role, activationLink }) {
  const emailServiceUrl = env.EMAIL_SERVICE_URL || "http://127.0.0.1:4008";
  const serviceAuthToken = env.SERVICE_AUTH_TOKEN || "8f4b27a91c5e4d31b0d7f4e8a2c91f3d7e5a4b1c9d2e3f6a";

  const subject = "Activate Your Normiloans CRM Account — Set Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #F26500; margin: 0; font-size: 22px;">Normiloans CRM</h2>
        <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Education Loan Lead-to-Disbursement Platform</p>
      </div>

      <p style="font-size: 15px; color: #0F2237; line-height: 1.6;">Hi <strong>${name}</strong>,</p>

      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        A new Loan CRM account has been registered for you with the assigned role: <strong style="color: #F26500;">${(role || "sales").toUpperCase()}</strong>.
      </p>

      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        To activate your account and access your dashboard, please click the button below to set up your password:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${activationLink}" target="_blank" style="display: inline-block; background-color: #F26500; color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 30px; box-shadow: 0 4px 12px rgba(242, 101, 0, 0.25);">
          Set Your Password &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #64748B; line-height: 1.5; background-color: #F8FAFC; padding: 12px; border-radius: 6px; border-left: 3px solid #F26500;">
        <strong>Security Notice:</strong> This activation link is valid for 24 hours and can only be used once. If you did not request this registration, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
        Normiloans CRM · Hyderabad, Telangana<br />
        This is an automated operational notification.
      </p>
    </div>
  `;

  const text = `Hi ${name},\n\nA Loan CRM account has been created for you (${email}) with role: ${(role || "sales").toUpperCase()}.\n\nPlease set your password by visiting this link:\n${activationLink}\n\nThis activation link is valid for 24 hours. If you did not request this registration, please ignore this message.\n\nNormiloans CRM`;

  try {
    const res = await fetch(`${emailServiceUrl}/api/v1/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Auth": serviceAuthToken,
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        text,
        senderName: "Normiloans CRM Team",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("[Loan CRM Backend] Email Service returned non-200 for activation:", data);
      return { success: false, error: data.error || "Email service error" };
    }

    console.log(`[Loan CRM Backend] Activation email sent to ${email} (MessageID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[Loan CRM Backend] Activation email dispatch failed: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Sends a transactional welcome email to a newly registered user via Loan CRM Email Service
 */
export async function sendWelcomeEmail({ email, name, role }) {
  const emailServiceUrl = env.EMAIL_SERVICE_URL || "http://127.0.0.1:4008";
  const serviceAuthToken = env.SERVICE_AUTH_TOKEN || "8f4b27a91c5e4d31b0d7f4e8a2c91f3d7e5a4b1c9d2e3f6a";

  const subject = "Welcome to Normiloans CRM";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #F26500; margin-top: 0;">Welcome to Normiloans CRM</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been successfully created in the <strong>Normiloans Education Lending Platform</strong>.</p>
      <div style="background-color: #EDF3FD; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Work Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Assigned Role:</strong> ${(role || "sales").toUpperCase()}</p>
      </div>
      <p>You can now sign in to your dashboard to manage leads, student applications, and disbursements.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748B;">Normiloans CRM — Fuel Your Ambitions<br />Hyderabad, Telangana</p>
    </div>
  `;

  const text = `Hi ${name},\n\nWelcome to Normiloans CRM! Your account (${email}) has been created with role: ${(role || "sales").toUpperCase()}.\n\nNormiloans CRM`;

  try {
    const res = await fetch(`${emailServiceUrl}/api/v1/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Auth": serviceAuthToken,
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        text,
        senderName: "Normiloans CRM Team",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("[Loan CRM Backend] Email Service returned non-200:", data);
      return { success: false, error: data.error || "Email service error" };
    }

    console.log(`[Loan CRM Backend] Welcome email sent to ${email} (MessageID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[Loan CRM Backend] Email Service call failed (non-blocking): ${message}`);
    return { success: false, error: message };
  }
}

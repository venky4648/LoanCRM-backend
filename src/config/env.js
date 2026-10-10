import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`[Loan CRM Backend] Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB: process.env.MONGODB_DB || "loan_crm_db",
  JWT_SECRET: process.env.JWT_SECRET || "loancrm_default_jwt_secret_key_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL || "http://127.0.0.1:4008",
  SERVICE_AUTH_TOKEN: process.env.SERVICE_AUTH_TOKEN || "8f4b27a91c5e4d31b0d7f4e8a2c91f3d7e5a4b1c9d2e3f6a",
};


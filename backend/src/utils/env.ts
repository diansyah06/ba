import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const PASSWORD_SECRET: string = process.env.SECRET_PASSWORD || "";
export const JWT_SECRET: string = process.env.JWT_SECRET || "";
export const TEMP_JWT_SECRET: string = process.env.TEMP_JWT_SECRET || "";

export const CLOUDINARY_CLOUD_NAME: string =
  process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET: string =
  process.env.CLOUDINARY_API_SECRET || "";

export const EMAIL_SMTP_SECURE: boolean =
  Boolean(process.env.EMAIL_SMTP_SECURE) || false;
export const EMAIL_SMTP_PASS: string = process.env.EMAIL_SMTP_PASS || "";
export const EMAIL_SMTP_USER: string = process.env.EMAIL_SMTP_USER || "";
export const EMAIL_SMTP_PORT: number =
  Number(process.env.EMAIL_SMTP_PORT) || 465;
export const EMAIL_SMTP_HOST: string = process.env.EMAIL_SMTP_HOST || "";
export const EMAIL_SMTP_SERVICE_NAME =
  process.env.EMAIL_SMTP_SERVICE_NAME || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const MIDTRANS_CLIENT_KEY: string =
  process.env.MIDTRANS_CLIENT_KEY || "";
export const MIDTRANS_SERVER_KEY: string =
  process.env.MIDTRANS_SERVER_KEY || "";
export const MIDTRANS_TRANSACTION_URL: string =
  process.env.MIDTRANS_TRANSACTION_URL || "";

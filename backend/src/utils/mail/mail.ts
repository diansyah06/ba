import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

import {
  EMAIL_SMTP_SERVICE_NAME,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_USER,
} from "../env";

// Initialize transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SMTP_SERVICE_NAME,
  host: EMAIL_SMTP_HOST,
  port: EMAIL_SMTP_PORT,
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
  requireTLS: true,
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Email templates enum
export enum EmailTemplate {
  NOTIFICATION_WAREHOUSE = "notification-warehouse",
  NOTIFICATION_APPROVAL = "notification-approval",
  NOTIFICATION_APPROVED = "notification-approved",
  NOTIFICATION_REJECTED = "notification-rejected",
}

// Base email options interface
export interface ISendMail {
  to: string | string[];
  subject: string;
  html: string;
}

// Template data interfaces
export interface IWarehouseNotificationData {
  recipientName: string;
  vendorName: string;
  documentNumber: string;
  documentCategory: string;
  warehouseName: string;
  description: string;
  createdAt: string;
}

export interface IApprovalNotificationData {
  recipientName: string;
  vendorName: string;
  documentNumber: string;
  documentCategory: string;
  warehouseVerifiedBy?: string;
  description: string;
  verifiedAt?: string;
}

// UBAH 1: Sesuaikan Interface dengan data dari Controller dan Template EJS
export interface IApprovedNotificationData {
  vendorName: string;      // Sesuai template <%= vendorName %>
  contractNumber: string;  // Sesuai template <%= contractNumber %>
  category: string;        // Sesuai template <%= category %>
  approverName: string;    // Sesuai template <%= approverName %>
  approvedAt: string;      // Sesuai template <%= approvedAt %>
  linkDashboard: string;   // Sesuai template <%= linkDashboard %>
  notes?: string;          // Sesuai template <%= notes %>
}

export interface IRejectedNotificationData {
  recipientName: string;
  documentNumber: string;
  documentCategory: string;
  rejectedBy: string;
  rejectedAt: string;
  notes: string;
  reason: string;
}

// Main send mail function
export const sendMail = async ({
  to,
  subject,
  html,
}: ISendMail): Promise<void> => {
  try {
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    const result = await transporter.sendMail({
      from: `"Sistem Notifikasi" <${EMAIL_SMTP_USER}>`,
      to: recipients,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
};

// Render email template
export const renderMailHTML = async (
  template: EmailTemplate,
  data: any
): Promise<string> => {
  try {
    const templatePath = path.join(__dirname, `templates/${template}.ejs`);
    const content = await ejs.renderFile(templatePath, data);
    return content as string;
  } catch (error) {
    console.error("Failed to render email template:", error);
    // Tambahkan log data untuk debugging jika error lagi
    console.error("Data passed to template:", data);
    throw new Error("Email template rendering failed");
  }
};

// High-level notification functions
export const sendWarehouseNotification = async (
  data: IWarehouseNotificationData,
  recipientEmail: string
): Promise<void> => {
  const html = await renderMailHTML(EmailTemplate.NOTIFICATION_WAREHOUSE, data);
  await sendMail({
    to: recipientEmail,
    subject: `[Verifikasi Diperlukan] Dokumen Baru dari ${data.vendorName}`,
    html,
  });
};

export const sendApprovalNotification = async (
  data: IApprovalNotificationData,
  recipientEmail: string
): Promise<void> => {
  const html = await renderMailHTML(EmailTemplate.NOTIFICATION_APPROVAL, data);
  await sendMail({
    to: recipientEmail,
    subject: `[Persetujuan Diperlukan] Dokumen ${data.documentNumber}`,
    html,
  });
};

// UBAH 2: Rename fungsi & Tukar parameter agar sesuai Controller
// Controller memanggil: sendEmailApproved(email, data)
export const sendEmailApproved = async (
  recipientEmail: string,          // Email ditaruh pertama
  data: IApprovedNotificationData  // Data ditaruh kedua
): Promise<void> => {
  const html = await renderMailHTML(EmailTemplate.NOTIFICATION_APPROVED, data);
  await sendMail({
    to: recipientEmail,
    subject: `✅ Dokumen ${data.contractNumber} Telah Disetujui`, // Gunakan contractNumber sesuai data
    html,
  });
};

export const sendRejectedNotification = async (
  data: IRejectedNotificationData,
  recipientEmail: string
): Promise<void> => {
  const html = await renderMailHTML(EmailTemplate.NOTIFICATION_REJECTED, data);
  await sendMail({
    to: recipientEmail,
    subject: `⚠️ Dokumen ${data.documentNumber} Memerlukan Revisi`,
    html,
  });
};
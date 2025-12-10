import {
  sendWarehouseNotification,
  sendApprovalNotification,
  sendApprovedNotification,
  sendRejectedNotification,
  IWarehouseNotificationData,
  IApprovalNotificationData,
  IApprovedNotificationData,
  IRejectedNotificationData,
} from "./mail/mail";
import { TypeReportDocument } from "../models/reportDocumet.model";
import { CATEGORY_REPORT_DOCUMENT } from "./constant";

/**
 * Service untuk menangani notifikasi email pada berbagai tahap workflow dokumen
 */
export class NotificationService {
  /**
   * Kirim notifikasi ke PIC Gudang saat ada dokumen BAPB baru atau resubmit
   */
  static async notifyWarehouseCheck(
    document: any,
    warehouseUser: any,
    vendorName: string
  ): Promise<void> {
    try {
      if (!warehouseUser.email) {
        console.warn("Warehouse user does not have an email address");
        return;
      }

      const data: IWarehouseNotificationData = {
        recipientName: warehouseUser.fullname,
        vendorName: vendorName,
        documentNumber: document.contractNumber,
        documentCategory: document.category,
        warehouseName: warehouseUser.warehouseName || "Gudang Anda",
        description: document.description,
        createdAt: new Date(document.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      await sendWarehouseNotification(data, warehouseUser.email);
      console.log(`Warehouse notification sent to ${warehouseUser.email}`);
    } catch (error) {
      console.error("Failed to send warehouse notification:", error);
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  /**
   * Kirim notifikasi ke approver (Pemesan Barang / Direksi) saat dokumen siap disetujui
   */
  static async notifyApprovalNeeded(
    document: any,
    approverUser: any,
    vendorName: string,
    warehouseCheckerName?: string
  ): Promise<void> {
    try {
      if (!approverUser.email) {
        console.warn("Approver user does not have an email address");
        return;
      }

      const data: IApprovalNotificationData = {
        recipientName: approverUser.fullname,
        vendorName: vendorName,
        documentNumber: document.contractNumber,
        documentCategory: document.category,
        description: document.description,
        warehouseVerifiedBy: warehouseCheckerName,
        verifiedAt: document.warehouseCheck?.checkAt
          ? new Date(document.warehouseCheck.checkAt).toLocaleDateString(
              "id-ID",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : undefined,
      };

      await sendApprovalNotification(data, approverUser.email);
      console.log(`Approval notification sent to ${approverUser.email}`);
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }
  }

  /**
   * Kirim notifikasi ke vendor saat dokumen disetujui
   */
  static async notifyDocumentApproved(
    document: any,
    vendorUser: any,
    approverName: string
  ): Promise<void> {
    try {
      if (!vendorUser.email) {
        console.warn("Vendor user does not have an email address");
        return;
      }

      const data: IApprovedNotificationData = {
        recipientName: vendorUser.fullname,
        documentNumber: document.contractNumber,
        documentCategory: document.category,
        approvedBy: approverName,
        approvedAt: new Date(
          document.approvalInfo?.approveAt || new Date()
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        notes: document.approvalInfo?.notes,
      };

      await sendApprovedNotification(data, vendorUser.email);
      console.log(`Approval success notification sent to ${vendorUser.email}`);
    } catch (error) {
      console.error("Failed to send approval success notification:", error);
    }
  }

  /**
   * Kirim notifikasi ke vendor saat dokumen ditolak
   */
  static async notifyDocumentRejected(
    document: any,
    vendorUser: any,
    rejectorName: string,
    rejectionStage: "warehouse" | "approval"
  ): Promise<void> {
    try {
      if (!vendorUser.email) {
        console.warn("Vendor user does not have an email address");
        return;
      }

      const reason =
        rejectionStage === "warehouse"
          ? "Dokumen tidak lolos verifikasi gudang"
          : "Dokumen tidak memenuhi persyaratan persetujuan";

      const notes =
        rejectionStage === "warehouse"
          ? document.warehouseCheck?.notes || "Tidak ada catatan"
          : document.approvalInfo?.notes || "Tidak ada catatan";

      const rejectedAt =
        rejectionStage === "warehouse"
          ? document.warehouseCheck?.checkAt
          : document.approvalInfo?.approveAt;

      const data: IRejectedNotificationData = {
        recipientName: vendorUser.fullname,
        documentNumber: document.contractNumber,
        documentCategory: document.category,
        rejectedBy: rejectorName,
        rejectedAt: new Date(rejectedAt || new Date()).toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        notes: notes,
        reason: reason,
      };

      await sendRejectedNotification(data, vendorUser.email);
      console.log(`Rejection notification sent to ${vendorUser.email}`);
    } catch (error) {
      console.error("Failed to send rejection notification:", error);
    }
  }
}

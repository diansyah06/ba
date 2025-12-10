export enum ROLES {
  ADMINISTRATOR = "administrator",
  VENDOR = "vendor",
  PEMESANBARANG = "pemesanbarang",
  DIREKSIPEKERJAAN = "direksipekerjaan",
  PICGUDANG = "picgudang",
  PENDINGAPPROVAL = "pendingapproval",
}

export enum STATUS_COMPANY {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum STATUS_WAREHOUSE {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum CATEGORY_REPORT_DOCUMENT {
  BAPB = "bapb",
  BAPP = "bapp",
}

export enum STATUS_REPORT_DOCUMENT {
  PENDING = "pending",
  REVISION = "revision",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum STATUS_WAREHOUSE_CHECK {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum VENDOR_PAYMENT_STATUS {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

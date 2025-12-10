import mongoose, { Schema } from "mongoose";
import * as Yup from "yup";
import {
  CATEGORY_REPORT_DOCUMENT,
  STATUS_REPORT_DOCUMENT,
  STATUS_WAREHOUSE_CHECK,
} from "../utils/constant";
import { COMPANY_MODEL_NAME } from "./company.model";
import { WAREHOUSE_MODEL_NAME } from "./warehouse.model";
import { USER_MODEL_NAME } from "./user.model";

export const REPORT_DOCUMENT_MODEL_NAME = "ReportDocument";

export const reportDocumentDAO = Yup.object({
  category: Yup.string()
    .oneOf([CATEGORY_REPORT_DOCUMENT.BAPB, CATEGORY_REPORT_DOCUMENT.BAPP])
    .required(),
  contractNumber: Yup.string().required(),
  paymentNominal: Yup.number().min(1).required(),
  description: Yup.string().required(),
  status: Yup.string().oneOf([
    STATUS_REPORT_DOCUMENT.PENDING,
    STATUS_REPORT_DOCUMENT.APPROVED,
    STATUS_REPORT_DOCUMENT.REJECTED,
  ]),
  targetWarehouse: Yup.string()
    .nullable()
    .when("category", {
      is: CATEGORY_REPORT_DOCUMENT.BAPB,
      then: (schema) =>
        Yup.string().required("Target Warehouse is required for BAPB"),
      otherwise: (schema) => Yup.string().nullable(),
    }),
  vendorSnapshot: Yup.object()
    .shape({
      companyRefId: Yup.string().required(),
      companyName: Yup.string().required(),
      picName: Yup.string().required(),
    })
    .required(),
  warehouseCheck: Yup.object()
    .shape({
      warehouseRefId: Yup.string().required(),
      warehouseName: Yup.string().required(),
      checkerRefId: Yup.string().required(),
      checkerName: Yup.string().required(),
      checkAt: Yup.string().required(),
      checkStatus: Yup.string()
        .oneOf([
          STATUS_WAREHOUSE_CHECK.PENDING,
          STATUS_WAREHOUSE_CHECK.APPROVED,
          STATUS_WAREHOUSE_CHECK.REJECTED,
        ])
        .required(),
      notes: Yup.string().required(),
      digitalSignature: Yup.string().optional().nullable(), // Opsional dulu agar tidak error data lama
      images: Yup.array()
        .of(
          Yup.object().shape({
            url: Yup.string().required(),
            publicId: Yup.string().required(),
            uploadedAt: Yup.string().required(),
          })
        )
        .optional()
        .default([]),
    })
    .nullable()
    .optional()
    .default(null),
  approvalInfo: Yup.object()
    .shape({
      approvalRefId: Yup.string().required(),
      approvalByName: Yup.string().required(),
      approveAt: Yup.string().required(),
      notes: Yup.string().required(),
      isSigned: Yup.boolean().required(),
      digitalSignature: Yup.string().required(),
    })
    .nullable()
    .optional()
    .default(null),
  createdBy: Yup.string().required(),
  createdAt: Yup.string(),
  updatedAt: Yup.string(),
});

export const verifyWarehouseValidationSchema = Yup.object({
  checkStatus: Yup.string()
    .oneOf(Object.values(STATUS_WAREHOUSE_CHECK))
    .required(),
  notes: Yup.string().required(),
});

export type TypeReportDocument = Yup.InferType<typeof reportDocumentDAO>;

export interface ImageMetaData {
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface ReportDocument
  extends Omit<
    TypeReportDocument,
    | "vendorSnapshot"
    | "warehouseCheck"
    | "approvalInfo"
    | "createdBy"
    | "targetWarehouse"
  > {
  targetWarehouse?: Schema.Types.ObjectId | null;
  vendorSnapshot: {
    companyRefId: Schema.Types.ObjectId;
    companyName: string;
    picName: string;
  };
  warehouseCheck?: {
    warehouseRefId: Schema.Types.ObjectId;
    warehouseName: string;
    checkerRefId: Schema.Types.ObjectId;
    checkerName: string;
    checkAt: Date;
    checkStatus: STATUS_WAREHOUSE_CHECK;
    digitalSignature?: string; // TAMBAHKAN INI DI INTERFACE
    notes: string;
  } | null;
  approvalInfo?: {
    approvalRefId: Schema.Types.ObjectId;
    approvalByName: string;
    approveAt: Date;
    notes: string;
    isSigned: boolean;
    digitalSignature: string;
  } | null;
  createdBy: Schema.Types.ObjectId;
}

const ImageMetaDataSchema = new Schema<ImageMetaData>(
  {
    url: {
      type: Schema.Types.String,
      required: true,
    },
    publicId: {
      type: Schema.Types.String,
      required: true,
    },
    uploadedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const ReportDocumentSchema = new Schema<ReportDocument>(
  {
    category: {
      type: Schema.Types.String,
      enum: [CATEGORY_REPORT_DOCUMENT.BAPB, CATEGORY_REPORT_DOCUMENT.BAPP],
      required: true,
    },
    contractNumber: {
      type: Schema.Types.String,
      required: true,
    },
    paymentNominal: {
      type: Schema.Types.Number,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: [
        STATUS_REPORT_DOCUMENT.PENDING,
        STATUS_REPORT_DOCUMENT.APPROVED,
        STATUS_REPORT_DOCUMENT.REJECTED,
      ],
      default: STATUS_REPORT_DOCUMENT.PENDING,
    },
    targetWarehouse: {
      type: Schema.Types.String,
      ref: WAREHOUSE_MODEL_NAME,
      default: null,
    },
    vendorSnapshot: {
      type: {
        companyRefId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: COMPANY_MODEL_NAME,
        },
        companyName: {
          type: Schema.Types.String,
          required: true,
        },
        picName: {
          type: Schema.Types.String,
          required: true,
        },
      },
    },
    warehouseCheck: {
      type: {
        warehouseRefId: {
          type: Schema.Types.String,
          required: true,
          ref: WAREHOUSE_MODEL_NAME,
        },
        warehouseName: {
          type: Schema.Types.String,
          required: true,
        },
        checkerRefId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: USER_MODEL_NAME,
        },
        checkerName: {
          type: Schema.Types.String,
          required: true,
        },
        checkAt: {
          type: Schema.Types.Date,
          required: true,
        },
        checkStatus: {
          type: Schema.Types.String,
          enum: [
            STATUS_WAREHOUSE_CHECK.PENDING,
            STATUS_WAREHOUSE_CHECK.APPROVED,
            STATUS_WAREHOUSE_CHECK.REJECTED,
          ],
          default: STATUS_WAREHOUSE_CHECK.PENDING,
        },
        notes: {
          type: Schema.Types.String,
          required: true,
        },
        digitalSignature: {
          type: Schema.Types.String, // Menyimpan string Base64 gambar
          required: false,
        },
        images: {
          type: [ImageMetaDataSchema],
          default: [],
        },
      },
    },
    approvalInfo: {
      type: {
        approvalRefId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: USER_MODEL_NAME,
        },
        approvalByName: {
          type: Schema.Types.String,
          required: true,
        },
        approveAt: {
          type: Schema.Types.Date,
          required: true,
        },
        notes: {
          type: Schema.Types.String,
          required: true,
        },
        isSigned: {
          type: Schema.Types.Boolean,
          default: false,
        },
        digitalSignature: {
          type: Schema.Types.String,
          required: true,
        },
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
  },
  { timestamps: true }
);

const ReportDocumentModel = mongoose.model(
  REPORT_DOCUMENT_MODEL_NAME,
  ReportDocumentSchema
);

export default ReportDocumentModel;

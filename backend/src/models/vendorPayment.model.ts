import mongoose, { Schema } from "mongoose";
import * as Yup from "yup";
import { USER_MODEL_NAME } from "./user.model";
import { REPORT_DOCUMENT_MODEL_NAME } from "./reportDocumet.model";
import { TypeResponseMidtrans } from "../utils/payment";

import { getId } from "../utils/id";
import { VENDOR_PAYMENT_STATUS } from "../utils/constant";

export const VENDOR_PAYMENT_MODEL_NAME = "VendorPayment";

export const vendorPaymentDAO = Yup.object({
  reportDocumentId: Yup.string().required(),
});

export interface VendorPayment {
  VendorPaymentId: string;
  createdBy: mongoose.Types.ObjectId;
  reportDocument: mongoose.Types.ObjectId;
  total: number;
  snapResponse: TypeResponseMidtrans;
  status: VENDOR_PAYMENT_STATUS;
}

const VendorPaymentSchema = new Schema<VendorPayment>(
  {
    VendorPaymentId: {
      type: Schema.Types.String,
      unique: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
    reportDocument: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: REPORT_DOCUMENT_MODEL_NAME,
      unique: true,
    },
    total: {
      type: Schema.Types.Number,
      required: true,
    },
    snapResponse: {
      token: {
        type: String,
        required: true,
      },
      redirect_url: {
        type: String,
        required: true,
      },
    },
    status: {
      type: Schema.Types.String,
      enum: Object.values(VENDOR_PAYMENT_STATUS),
      default: VENDOR_PAYMENT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);


const VendorPaymentModel = mongoose.model(
  VENDOR_PAYMENT_MODEL_NAME,
  VendorPaymentSchema
);

export default VendorPaymentModel;

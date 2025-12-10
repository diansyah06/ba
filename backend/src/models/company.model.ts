import mongoose from "mongoose";
import * as yup from "yup";
import { STATUS_COMPANY } from "../utils/constant";

export const COMPANY_MODEL_NAME = "Company";

const Schema = mongoose.Schema;

export const companyDAO = yup.object({
  companyName: yup.string().required(),
  companyAddress: yup.string().required(),
  picName: yup.string().required(),
  status: yup
    .string()
    .oneOf([STATUS_COMPANY.ACTIVE, STATUS_COMPANY.INACTIVE])
    .required(),
});

export type Company = yup.InferType<typeof companyDAO>;

const CompanySchema = new Schema<Company>(
  {
    companyName: {
      type: Schema.Types.String,
      required: true,
    },
    companyAddress: {
      type: Schema.Types.String,
      required: true,
    },
    picName: {
      type: Schema.Types.String,
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: [STATUS_COMPANY.ACTIVE, STATUS_COMPANY.INACTIVE],
      default: STATUS_COMPANY.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyModel = mongoose.model(COMPANY_MODEL_NAME, CompanySchema);

export default CompanyModel;

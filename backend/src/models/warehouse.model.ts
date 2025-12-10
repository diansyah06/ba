import mongoose from "mongoose";
import * as yup from "yup";
import { STATUS_WAREHOUSE } from "../utils/constant";

export const WAREHOUSE_MODEL_NAME = "Warehouse";

const Schema = mongoose.Schema;

export const warehouseDAO = yup.object({
  warehouseName: yup.string().required(),
  warehouseAddress: yup.string().required(),
  status: yup
    .string()
    .oneOf([STATUS_WAREHOUSE.ACTIVE, STATUS_WAREHOUSE.INACTIVE])
    .required(),
});

export type Warehouse = yup.InferType<typeof warehouseDAO>;

const WarehouseSchema = new Schema<Warehouse>(
  {
    warehouseName: {
      type: Schema.Types.String,
      required: true,
    },
    warehouseAddress: {
      type: Schema.Types.String,
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: [STATUS_WAREHOUSE.ACTIVE, STATUS_WAREHOUSE.INACTIVE],
      default: STATUS_WAREHOUSE.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

const WarehouseModel = mongoose.model(WAREHOUSE_MODEL_NAME, WarehouseSchema);

export default WarehouseModel;

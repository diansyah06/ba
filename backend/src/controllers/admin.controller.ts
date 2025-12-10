import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import VendorModel from "../models/company.model";
import response from "../utils/response";
import { ROLES } from "../utils/constant";
import WarehouseModel from "../models/warehouse.model";
import { isValidObjectId } from "mongoose";

const assignRoleSchema = Yup.object({
  role: Yup.string()
    .required()
    .oneOf([
      ROLES.ADMINISTRATOR,
      ROLES.VENDOR,
      ROLES.PICGUDANG,
      ROLES.PEMESANBARANG,
      ROLES.DIREKSIPEKERJAAN,
    ]),
  vendorId: Yup.string().when("role", {
    is: (val: string) => val === ROLES.VENDOR,
    then: (schema) =>
      schema
        .required()
        .test("isValidObjectId", "Invalid Vendor Id", (value) =>
          isValidObjectId(value)
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  warehouseId: Yup.string().when("role", {
    is: (val: string) => val === ROLES.PICGUDANG,
    then: (schema) =>
      schema
        .required()
        .test("isValidObjectId", "Invalid Warehouse Id", (value) =>
          isValidObjectId(value)
        ),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default {
  async getUser(req: IReqUser, res: Response) {
    try {
      const result = await UserModel.find();

      response.success(res, result, "Success get user");
    } catch (error) {
      response.error(res, error, "failed get user pending approval");
    }
  },
  async assignRole(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const { role, vendorId, warehouseId } = req.body;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "User not found");
      }

      await assignRoleSchema.validate(req.body);

      if (role === ROLES.VENDOR) {
        const vendorExist = await VendorModel.findById(vendorId);
        if (!vendorExist) {
          return response.notFound(res, "Vendor data not found");
        }
      }

      if (role === ROLES.PICGUDANG) {
        const warehouseExist = await WarehouseModel.findById(warehouseId);
        if (!warehouseExist) {
          return response.notFound(res, "Warehouse data not found");
        }
      }

      const updatePayload = {
        role: role,
        vendorId: role === ROLES.VENDOR ? vendorId : null,
        warehouseId: role === ROLES.PICGUDANG ? warehouseId : null,
        isActive: true,
      };

      const result = await UserModel.findByIdAndUpdate(id, updatePayload, {
        new: true,
      });

      if (!result) {
        return response.error(res, null, "User not found");
      }

      response.success(res, result, "Success assign role user");
    } catch (error) {
      response.error(res, error, "failed assign role user");
    }
  },
  async removeUser(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "User not found");
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return response.notFound(res, "User not found");
      }

      if (req.user?.id?.toString() === id) {
        return response.error(res, null, "Cannot delete own user account");
      }

      if (user.role === ROLES.ADMINISTRATOR) {
        return response.error(res, null, "Cannot delete administrator account");
      }

      const result = await UserModel.findByIdAndDelete(id, {
        new: true,
      });

      response.success(res, result, "Success delete user");
    } catch (error) {
      response.error(res, error, "failed delete user");
    }
  }
};

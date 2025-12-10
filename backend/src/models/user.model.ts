import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { ROLES } from "../utils/constant";
import { COMPANY_MODEL_NAME } from "./company.model";
import { WAREHOUSE_MODEL_NAME } from "./warehouse.model";
import * as Yup from "yup";

export const USER_MODEL_NAME = "User";

export interface User {
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture: string;
  isActive: boolean;
  activationCode: string;
  vendorId?: mongoose.Types.ObjectId;
  warehouseId?: mongoose.Types.ObjectId;
  security: {
    is2FAConfigured: boolean;
    twoFactorSecret: string;
  };
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>(
  {
    fullname: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: [
        ROLES.ADMINISTRATOR,
        ROLES.VENDOR,
        ROLES.PEMESANBARANG,
        ROLES.DIREKSIPEKERJAAN,
        ROLES.PICGUDANG,
        ROLES.PENDINGAPPROVAL,
      ],
      default: ROLES.PENDINGAPPROVAL,
    },
    profilePicture: {
      type: Schema.Types.String,
      default: "user.jpg",
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: COMPANY_MODEL_NAME,
      default: null,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: WAREHOUSE_MODEL_NAME,
      default: null,
    },
    security: {
      is2FAConfigured: {
        type: Schema.Types.Boolean,
        default: false,
      },
      twoFactorSecret: {
        type: Schema.Types.String,
        select: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = encrypt(this.password);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.security?.twoFactorSecret;
  return user;
};

const UserModel = mongoose.model(USER_MODEL_NAME, UserSchema);

export default UserModel;

import { Request } from "express";
import { Types } from "mongoose";
import { User } from "../models/user.model";

export interface IUserToken
  extends Omit<
    User,
    | "password"
    | "activationCode"
    | "isActive"
    | "email"
    | "fullname"
    | "profilePicture"
    | "username"
    | "security"
  > {
  id?: Types.ObjectId;
}

export interface IReqUser extends Request {
  params: { id: any; };
  body: { role: any; vendorId: any; warehouseId: any; };
  user?: IUserToken;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}

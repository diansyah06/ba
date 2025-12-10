import { Types } from "mongoose";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET, TEMP_JWT_SECRET } from "./env";
import { IUserToken } from "./interfaces";

export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

export const generateTempToken = (user: IUserToken): string => {
  const token = jwt.sign(user, TEMP_JWT_SECRET, {
    expiresIn: "5m",
  });
  return token;
};

export const getUserData = (token: string) => {
  const user = jwt.verify(token, JWT_SECRET) as IUserToken;

  return user;
};

export const verifyTempToken = (token: string): IUserToken => {
  const user = jwt.verify(token, TEMP_JWT_SECRET) as IUserToken;

  return user;
};

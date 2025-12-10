import crypto from "crypto";
import { PASSWORD_SECRET } from "./env";

export const encrypt = (Password: string): string => {
  const encrypted = crypto
    .pbkdf2Sync(Password, PASSWORD_SECRET, 10000, 64, "sha512")
    .toString("hex");
  return encrypted;
};

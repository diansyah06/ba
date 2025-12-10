import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import {
  generateToken,
  generateTempToken,
  verifyTempToken,
} from "../utils/jwt";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import { verifyTwoFactorToken } from "../utils/2fa";

type TRegister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

type TUpdatePassword = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type TVerifyLogin2FA = {
  tempToken: string;
  token: string;
};

const registerValidateSchema = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters long")
    .test(
      "at-least-one-uppercase-letter",
      "Password must contain at least one uppercase letter",
      (value) => {
        if (!value) {
          return false;
        }
        const regex = /(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test(
      "at-least-one-number",
      "Password must contain at least one number",
      (value) => {
        if (!value) {
          return false;
        }
        const regex = /(?=.*\d)/;
        return regex.test(value);
      }
    ),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password does not match"),
});

const verifyLogin2FASchema = Yup.object({
  tempToken: Yup.string().required(),
  token: Yup.string()
    .required("2FA token is required")
    .length(6, "Token must be 6 digits long")
    .matches(/^\d+$/, "Token must contain only numbers"),
});

const updatePasswordSchema = Yup.object({
  currentPassword: Yup.string().required(),
  newPassword: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters long")
    .test(
      "at-least-one-uppercase-letter",
      "Password must contain at least one uppercase letter",
      (value) => {
        if (!value) {
          return false;
        }
        const regex = /(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test(
      "at-least-one-number",
      "Password must contain at least one number",
      (value) => {
        if (!value) {
          return false;
        }
        const regex = /(?=.*\d)/;
        return regex.test(value);
      }
    ),
  confirmNewPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("newPassword"), ""], "Password does not match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullname, username, email, password, confirmPassword } =
      req.body as TRegister;

    try {
      await registerValidateSchema.validate({
        fullname,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullname,
        username,
        email,
        password,
      });

      response.success(res, result, "Success register user");
    } catch (error) {
      const err = error as Error;
      response.error(res, err, "failed register user");
    }
  },
  async login(req: Request, res: Response) {
    /**
     * #swagger.requestBody = {
     * required: true,
     * schema: {$ref: "#/components/schemas/LoginRequest"}
     * }
     */
    const { identifier, password } = req.body as TLogin;

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      }).select("+security.twoFactorSecret");

      if (!userByIdentifier)
        return response.unauthorized(res, "User not found");

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthorized(res, "User not found");
      }

      if (userByIdentifier.security.is2FAConfigured) {
        const tempToken = generateTempToken({
          id: userByIdentifier._id,
          role: userByIdentifier.role,
        });

        return response.success(
          res,
          {
            require2FA: true,
            tempToken,
            message: "Please provide your 2FA token to complete login",
          },
          "2FA verification required"
        );
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      response.success(res, { token }, "Success login user");
    } catch (error) {
      const err = error as Error;
      response.error(res, err, "failed login user");
    }
  },
  async verifyLogin2FA(req: Request, res: Response) {
    const { tempToken, token } = req.body as TVerifyLogin2FA;

    try {
      await verifyLogin2FASchema.validate(req.body);

      let userData;
      try {
        userData = verifyTempToken(tempToken);
      } catch (error) {
        return response.unauthorized(
          res,
          "Temporary token expired or invalid. Please login again."
        );
      }

      const user = await UserModel.findById(userData.id).select(
        "+security.twoFactorSecret"
      );

      if (!user) {
        return response.unauthorized(res, "User not found");
      }

      if (!user.security.is2FAConfigured) {
        return response.badRequest(res, "2FA is not enabled for this user");
      }

      const isValid = verifyTwoFactorToken(
        token,
        user.security.twoFactorSecret
      );

      if (!isValid) {
        return response.unauthorized(res, "Invalid 2FA token");
      }

      const authToken = generateToken({
        id: user._id,
        role: user.role,
      });

      response.success(
        res,
        authToken,
        "Login successful with 2FA verification"
      );
    } catch (error) {
      response.error(res, error, "failed verify login 2fa");
    }
  },
  async me(req: IReqUser, res: Response) {
    /**
     * #swagger.secuirty = [{
     * "bearerAuth": []
     * }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "Success get user profile");
    } catch (error) {
      const err = error as Error;
      response.error(res, err, "failed get user profile");
    }
  },
  async updatePassword(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      // FIX: Gunakan double casting 'as unknown as TUpdatePassword'
      // untuk menghindari konflik tipe data dengan IReqUser
      const { currentPassword, newPassword, confirmNewPassword } = req.body as unknown as TUpdatePassword;

      await updatePasswordSchema.validate({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      const user = await UserModel.findById(userId);

      if (!user || user.password !== encrypt(currentPassword)) {
        return response.notFound(res, "User not found");
      }

      const result = await UserModel.findByIdAndUpdate(
        userId,
        { 
          password: encrypt(newPassword) 
        },
        { 
          new: true 
        }
      );

      response.success(res, result, "Success update user password");
    } catch (error) {
      response.error(res, error as Error, "failed update user password");
    }
  }
};
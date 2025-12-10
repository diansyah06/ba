import { Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { generateTwoFactorSecret, verifyTwoFactorToken } from "../utils/2fa";
import { generateTempToken, verifyTempToken } from "../utils/jwt";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import { encrypt } from "../utils/encryption";
import { verify } from "jsonwebtoken";

type TSetup2FA = {
  password: string;
};

type TVerify2FA = {
  token: string;
  password: string;
};

type TDisable2FA = {
  password: string;
  token: string;
};

const setup2FAValidateSchema = Yup.object({
  password: Yup.string().required(),
});

const verify2FAValidateSchema = Yup.object({
  token: Yup.string()
    .required()
    .length(6)
    .matches(/^\d+$/, "Token must contain only numbers"),
});

const disable2FAValidateSchema = Yup.object({
  password: Yup.string().required(),
  token: Yup.string()
    .required()
    .length(6)
    .matches(/^\d+$/, "Token must contain only numbers"),
});

export default {
  async setup2FA(req: IReqUser, res: Response) {
    try {
      const { password } = req.body as TSetup2FA;
      const userId = req.user?.id;

      await setup2FAValidateSchema.validate(req.body);

      if (!userId) {
        return response.unauthorized(res, "User not found");
      }

      const user = await UserModel.findById(userId).select("+password");
      if (!user) {
        return response.notFound(res, "User not found");
      }

      const isPasswordValid: boolean = encrypt(password) === user.password;

      if (!isPasswordValid) {
        return response.unauthorized(res, "Invalid password");
      }

      if (user.security.is2FAConfigured) {
        return response.badRequest(res, "2FA already configured");
      }

      const userIdentifier = user.email || user.username;
      const twoFactorData = await generateTwoFactorSecret(userIdentifier);

      user.security.twoFactorSecret = twoFactorData.secret;
      await user.save();

      response.success(
        res,
        {
          qrCode: twoFactorData.qrCodeDataUrl,
          secret: twoFactorData.secret,
          message:
            "Scan this QR code with your authenticator app and verify with a token",
        },
        "Success setup 2fa"
      );
    } catch (error) {
      response.error(res, error, "failed setup 2fa");
    }
  },
  async verify2FA(req: IReqUser, res: Response) {
    try {
      const { token } = req.body as TVerify2FA;
      const userId = req.user?.id;

      await verify2FAValidateSchema.validate(req.body);

      if (!userId) {
        return response.unauthorized(res, "User not found");
      }

      const user = await UserModel.findById(userId).select(
        "+security.twoFactorSecret"
      );

      if (!user) {
        return response.notFound(res, "User not found");
      }

      if (!user.security.twoFactorSecret) {
        return response.badRequest(res, "2FA not configured");
      }

      if (user.security.is2FAConfigured) {
        return response.badRequest(res, "2FA already configured");
      }

      const isValid = verifyTwoFactorToken(
        token,
        user.security.twoFactorSecret
      );

      if (!isValid) {
        return response.unauthorized(res, "Invalid 2FAtoken");
      }

      user.security.is2FAConfigured = true;
      await user.save();

      response.success(
        res,
        {
          is2FAEnabled: true,
          message: "2FA has been successfully configured",
        },
        "Success verify 2fa"
      );
    } catch (error) {
      response.error(res, error, "failed verify 2fa");
    }
  },
  async disable2FA(req: IReqUser, res: Response) {
    try {
      const { token, password } = req.body as TDisable2FA;
      const userId = req.user?.id;

      await disable2FAValidateSchema.validate(req.body);

      if (!userId) {
        return response.unauthorized(res, "User not found");
      }

      const user = await UserModel.findById(userId).select(
        "+password +security.twoFactorSecret"
      );

      if (!user) {
        return response.notFound(res, "User not found");
      }

      if (!user.security.is2FAConfigured) {
        return response.badRequest(res, "2FA is not configured");
      }

      const isPasswordValid: boolean = encrypt(password) === user.password;

      if (!isPasswordValid) {
        return response.unauthorized(res, "Invalid password");
      }

      const isTokenValid: boolean = verifyTwoFactorToken(
        token,
        user.security.twoFactorSecret
      );

      if (!isTokenValid) {
        return response.unauthorized(res, "Invalid 2FAtoken");
      }

      user.security.is2FAConfigured = false;
      user.security.twoFactorSecret = "";
      await user.save();

      response.success(
        res,
        {
          is2FAEnabled: false,
          message: "2FA has been successfully disabled",
        },
        "Success disable 2fa"
      );
    } catch (error) {
      response.error(res, error, "failed disable 2fa");
    }
  },
  async get2FAStatus(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.unauthorized(res, "User not found");
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return response.notFound(res, "User not found");
      }

      response.success(
        res,
        {
          is2FAEnabled: user.security.is2FAConfigured,
        },
        "Success get 2fa status"
      );
    } catch (error) {
      response.error(res, error, "failed get 2fa status");
    }
  },
};

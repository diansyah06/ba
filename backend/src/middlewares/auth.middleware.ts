import { Request, Response, NextFunction } from "express";
import { getUserData } from "../utils/jwt";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return response.unauthorized(res, "unauthorized");
  }

  const [prefix, token] = authorization.split(" ");

  if (!(prefix === "Bearer" && token)) {
    return response.unauthorized(res, "unauthorized");
  }

  const user = getUserData(token);

  if (!user) {
    return response.unauthorized(res, "unauthorized");
  }

  (req as IReqUser).user = user;

  next();
};

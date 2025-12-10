import { Response, NextFunction } from "express";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";

export default (roles: string[]) => {
  return (req: IReqUser, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return response.unauthorized(res, "unauthorized");
    }

    next();
  };
};

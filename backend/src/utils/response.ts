import { Response } from "express";
import mongoose from "mongoose";
import * as Yup from "yup";

type Pagination = {
  totalPages: number;
  current: number;
  total: number;
};

export default {
  success(res: Response, data: any, message: string) {
    res.status(200).json({
      meta: {
        status: 200,
        message: message,
      },
      data: data,
    });
  },
  created(res: Response, data: any, message: string) {
    res.status(201).json({
      meta: {
        status: 201,
        message: message,
      },
      data: data,
    });
  },
  error(res: Response, error: unknown, message: string) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        meta: {
          status: 400,
          message: message,
        },
        data: {
          [`${error.path}`]: error.errors[0],
        },
      });
    }

    if (error instanceof mongoose.Error) {
      return res.status(500).json({
        meta: {
          status: 500,
          message: error.message,
        },
        data: error.name,
      });
    }

    if ((error as any)?.code) {
      const _err = error as any;
      return res.status(500).json({
        meta: {
          status: 500,
          message: _err.errorResponse.errmsg,
        },
        data: _err,
      });
    }

    res.status(500).json({
      meta: {
        status: 500,
        message: message,
      },
      data: error,
    });
  },
  badRequest(res: Response, message: string = "Bad Request") {
    res.status(400).json({
      meta: {
        status: 400,
        message: message,
      },
      data: null,
    });
  },
  notFound(res: Response, message: string = "Not Found") {
    res.status(404).json({
      meta: {
        status: 404,
        message: message,
      },
      data: null,
    });
  },
  unauthorized(res: Response, message: string = "Unauthorized") {
    res.status(403).json({
      meta: {
        status: 403,
        message: message,
      },
      data: null,
    });
  },
  pagination(
    res: Response,
    data: any[],
    pagination: Pagination,
    message: string
  ) {
    res.status(200).json({
      meta: {
        status: 200,
        message: message,
      },
      data: data,
      pagination: pagination,
    });
  },
};

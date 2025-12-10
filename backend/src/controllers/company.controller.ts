import { Response } from "express";
import response from "../utils/response";
import CompanyModel, { companyDAO } from "../models/company.model";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await companyDAO.validate(req.body);
      const result = await CompanyModel.create(req.body);
      response.success(res, result, "Success create a vendor");
    } catch (error) {
      response.error(res, error, "failed create a vendor");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPaginationQuery;
    try {
      const query = {};

      if (search) {
        Object.assign(query, {
          companyName: { $regex: search, $options: "i" },
        });
      }

      const result = await CompanyModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await CompanyModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          current: page,
        },
        "Success find all vendor"
      );
    } catch (error) {
      response.error(res, error, "failed find all vendor");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await CompanyModel.findById(id);
      response.success(res, result, "Success find one vendor");
    } catch (error) {
      response.error(res, error, "failed find one vendor");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await CompanyModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Success update vendor");
    } catch (error) {
      response.error(res, error, "failed update vendor");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await CompanyModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Success delete vendor");
    } catch (error) {
      response.error(res, error, "failed delete vendor");
    }
  },
};

import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import VendorPaymentModel, {
  vendorPaymentDAO,
} from "../models/vendorPayment.model";
import { ReportDocumentModel } from "../models/reportDocument.model";
import { STATUSREPORTDOCUMENT, VendorPaymentStatus } from "../utils/constant";
import payment, { Payment } from "../utils/payment";
import { getId } from "../utils/id";
import { VendorPayment } from "./../models/vendorPayment.model";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const { reportDocumentId } = req.body;
      const user = req.user;

      await vendorPaymentDAO.validate({ reportDocumentId });

      const reportDoc = await ReportDocumentModel.findById(reportDocumentId);

      if (!reportDoc) {
        return response.error(res, null, "Report Document not found");
      }

      if (reportDoc.status !== STATUSREPORTDOCUMENT.APPROVED) {
        return response.error(res, null, "Report Document not approved");
      }

      if (reportDoc.paymentStatus === VendorPaymentStatus.PAID) {
        return response.error(res, null, "Report Document already paid");
      }

      const existingPayment = await VendorPaymentModel.findOne({
        reportDocument: reportDoc._id,
        status: {
          $in: [VendorPaymentStatus.PENDING, VendorPaymentStatus.PAID],
        },
      });

      if (existingPayment) {
        return response.error(res, null, "Vendor payment already exist");
      }

      const paymentId = `PAY-${getId()}`;

      const payload: Payment = {
        transaction_details: {
          order_id: paymentId,
          gross_amount: reportDoc.paymentNominal,
        },
      };

      const midtransResponse = await payment.createLink(payload);

      const newPayment = await VendorPaymentModel.create({
        VendorPaymentId: paymentId,
        creadtedBy: user?.id,
        reportDocument: reportDoc._id,
        total: reportDoc.paymentNominal,
        snapResponse: midtransResponse,
        status: VendorPaymentStatus.PENDING,
      });

      reportDoc.paymentStatus = VendorPaymentStatus.PENDING;
      await reportDoc.save();

      response.success(res, newPayment, "Success create vendor payment");
    } catch (error) {
      response.error(res, error, "failed create vendor payment");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
    } = req.query as unknown as IPaginationQuery & { status?: string };
    try {
      const user = req.user;
      const query: any = {};

      if (search) {
        query.vendorPaymentId = { $regex: search, $options: "i" };
      }

      if (status) {
        query.status = status;
      }

      const result = await VendorPaymentModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .populate("createdBy", "fullname email")
        .populate({
          path: "reportDocument",
          select: "contractNumber description paymentNominal vendorSnapshot",
        })
        .exec();

      const count = await VendorPaymentModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          current: page,
        },
        "Success find all vendor payment"
      );
    } catch (error) {
      response.error(res, error, "failed find all vendor payment");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "failed find one vendor payment");
    }
  },
  async complete(req: IReqUser, res: Response) {
    try {
      const { vendorPaymentId } = req.params;

      const vendorPayment = await VendorPaymentModel.findOne({
        vendorPaymentId,
      });

      if (!vendorPayment) {
        return response.error(res, null, "Vendor payment not found");
      }

      if (vendorPayment.status === VendorPaymentStatus.PAID) {
        return response.error(res, null, "Vendor payment already paid");
      }

      vendorPayment.status = VendorPaymentStatus.PAID;
      await vendorPayment.save();

      await ReportDocumentModel.findByIdAndUpdate(
        vendorPayment.reportDocument,
        {
          paymentStatus: VendorPaymentStatus.PAID,
        }
      );

      response.success(res, vendorPayment, "Success complete vendor payment");
    } catch (error) {
      response.error(res, error, "failed complete vendor payment");
    }
  },
  async pending(req: IReqUser, res: Response) {
    try {
      const { vendorPayemtId } = req.params;
      const userId = req.user?.id;

      const vendorPayment = await VendorPaymentModel.findOne({
        vendorPaymentId: vendorPayemtId,
        createdBy: userId,
      });

      if (!vendorPayment) {
        response.notFound(res, "Vendor payment not found");
      }

      if (vendorPayment?.status === VendorPaymentStatus.COMPLETED) {
        return response.error(res, null, "Vendor payment already completed");
      }

      if (vendorPayment?.status === VendorPaymentStatus.PENDING) {
        return response.error(res, null, "Vendor payment already pending");
      }

      const result = await vendorPayment?.findOneAndUpdate(
        {
          vendorPaymentId: vendorPayemtId,
          createdBy: userId,
        },
        {
          status: VendorPaymentStatus.PENDING,
        },
        {
          new: true,
        }
      );

      response.success(res, result, "Success pending vendor payment");
    } catch (error) {
      response.error(res, error, "failed pending vendor payment");
    }
  },
  async cancelled(req: IReqUser, res: Response) {
    try {
      const { vendorPayemtId } = req.params;
      const userId = req.user?.id;

      const vendorPayment = await VendorPaymentModel.findOne({
        vendorPaymentId: vendorPayemtId,
        createdBy: userId,
      });

      if (!vendorPayment) {
        response.notFound(res, "Vendor payment not found");
      }

      if (vendorPayment?.status === VendorPaymentStatus.COMPLETED) {
        return response.error(res, null, "Vendor payment already completed");
      }

      if (vendorPayment?.status === VendorPaymentStatus.PENDING) {
        return response.error(res, null, "Vendor payment already pending");
      }

      const result = await vendorPayment?.findOneAndUpdate(
        {
          vendorPaymentId: vendorPayemtId,
          createdBy: userId,
        },
        {
          status: VendorPaymentStatus.CANCELLED,
        },
        {
          new: true,
        }
      );

      response.success(res, result, "Success pending vendor payment");
    } catch (error) {
      response.error(res, error, "failed cancelled vendor payment");
    }
  },
};

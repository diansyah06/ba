import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import UserModel from "../models/user.model";
import CompanyModel from "../models/company.model";
import { FilterQuery, isValidObjectId } from "mongoose";
import { sendEmailApproved } from "../utils/mail/mail";
import { FRONTEND_URL } from "../utils/env";
import {
  CATEGORY_REPORT_DOCUMENT,
  ROLES,
  STATUS_REPORT_DOCUMENT,
  STATUS_WAREHOUSE_CHECK,
} from "../utils/constant";
import WarehouseModel from "../models/warehouse.model";
import { getDigitalSignature } from "../utils/digitalSignature";
import ReportDocumentModel, {
  ImageMetaData,
  reportDocumentDAO,
  TypeReportDocument,
  verifyWarehouseValidationSchema,
} from "../models/reportDocumet.model";
import uploader from "../utils/uploader";
import * as Yup from "yup";
import { NotificationService } from "../utils/notification";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;

      const user = await UserModel.findById(userId);
      if (!user) {
        return response.notFound(res, "User not found");
      }

      const company = await CompanyModel.findById(user.vendorId);
      if (!company) {
        return response.notFound(res, "Company not found");
      }

      const { category, targetWarehouse, ...otherBody } = req.body;

      // if (!isValidObjectId(targetWarehouse)) {
      //   return response.notFound(res, "targetWarehouse not found");
      // }

      let finalTargetWarehouseId = null;

      if (category === CATEGORY_REPORT_DOCUMENT.BAPB) {
        if (!targetWarehouse) {
          return response.error(
            res,
            null,
            "Target Warehouse (targetWarehouseId) is required for BAPB documents."
          );
        }

        const warehouseExist = await WarehouseModel.findById(targetWarehouse);
        if (!warehouseExist) {
          return response.notFound(res, "Target Warehouse not found");
        }

        finalTargetWarehouseId = targetWarehouse;
      }

      const payload = {
        ...otherBody,
        category: category,
        // UBAH 1: Konversi targetWarehouse jika ada
        targetWarehouse: finalTargetWarehouseId ? finalTargetWarehouseId.toString() : null,

        status: STATUS_REPORT_DOCUMENT.PENDING,
        vendorSnapshot: {
          // UBAH 2: Konversi vendorId ke string
          companyRefId: user.vendorId ? user.vendorId.toString() : "",
          companyName: company.companyName,
          picName: company.picName,
        },
        // UBAH 3: Konversi user._id ke string
        createdBy: user._id.toString(),

        warehouseCheck: null,
        approvalInfo: null,
      } as TypeReportDocument;

      await reportDocumentDAO.validate(payload);

      const result = await ReportDocumentModel.create(payload);

      if (
        category === CATEGORY_REPORT_DOCUMENT.BAPB &&
        finalTargetWarehouseId
      ) {
        try {
          // Cari PIC Gudang yang bertanggung jawab
          const warehouseUsers = await UserModel.find({
            role: ROLES.PICGUDANG,
            warehouseId: finalTargetWarehouseId,
          });

          // Kirim notifikasi ke semua PIC Gudang di warehouse tersebut
          for (const warehouseUser of warehouseUsers) {
            await NotificationService.notifyWarehouseCheck(
              result,
              warehouseUser,
              company.companyName
            );
          }
        } catch (notifError) {
          console.error("Notification error:", notifError);
          // Jangan block response jika notifikasi gagal
        }
      }

      response.created(res, result, "Success create a report document");
    } catch (error) {
      response.error(res, error, "failed create a report document");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const user = await UserModel.findById(req.user?.id);

      if (!user) {
        return response.notFound(res, "User not found");
      }
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeReportDocument> = {};

        if (user?.role === ROLES.VENDOR) {
          query.createdBy = user._id;
        } else if (user?.role === ROLES.PICGUDANG) {
          query.category = CATEGORY_REPORT_DOCUMENT.BAPB;
          if (user.warehouseId) {
            query.targetWarehouse = user.warehouseId;
          } else {
            query.targetWarehouse = "000000000000000000000000";
          }
        } else if (user?.role === ROLES.PEMESANBARANG) {
          query.category = CATEGORY_REPORT_DOCUMENT.BAPB;
        } else if (user?.role === ROLES.DIREKSIPEKERJAAN) {
          query.category = CATEGORY_REPORT_DOCUMENT.BAPP;
        }

        if (filter.search) {
          query.$text = { $search: filter.search };
        }

        if (filter.category) {
          query.category = filter.category;
        }

        if (filter.status) {
          query.status = filter.status;
        }

        return query;
      };

      const { limit = 10, page = 1, search, category, status } = req.query;

      const query = buildQuery({ search, category, status });

      const result = await ReportDocumentModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await ReportDocumentModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        "Success find all report document"
      );
    } catch (error) {
      response.error(res, error, "failed find all report document");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed find one report document");
      }

      const result = await ReportDocumentModel.findById(id);

      if (!result) {
        return response.notFound(res, "failed find one report document");
      }

      if (
        user?.role === ROLES.VENDOR &&
        result.createdBy.toString() !== user?.id?.toString()
      ) {
        return response.unauthorized(res, "unauthorized");
      }

      response.success(res, result, "Success find one report document");
    } catch (error) {
      response.error(res, error, "failed find one report document");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await ReportDocumentModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      response.success(res, result, "Success update a report document");
    } catch (error) {
      response.error(res, error, "failed delete a report document");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await ReportDocumentModel.findByIdAndDelete(id, {
        new: true,
      });

      response.success(res, result, "Success update a report document");
    } catch (error) {
      response.error(res, error, "failed delete a report document");
    }
  },
  async resubmit(req: IReqUser, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return response.notFound(res, "User not found");
    }

    if (!isValidObjectId(id)) {
      return response.notFound(res, "failed find one report document");
    }

    const doc = await ReportDocumentModel.findById(id);

    if (!doc) {
      return response.notFound(res, "Report Document not found");
    }

    if (doc.createdBy.toString() !== user._id.toString()) {
      return response.unauthorized(res, "unauthorized");
    }

    if (doc.status === STATUS_REPORT_DOCUMENT.APPROVED) {
      return response.error(res, null, "Report Document already approved");
    }

    doc.status = STATUS_REPORT_DOCUMENT.PENDING;
    doc.approvalInfo = null;

    if (doc.category === CATEGORY_REPORT_DOCUMENT.BAPB) {
      doc.warehouseCheck = null;
    }

    delete req.body.status;
    delete req.body.vendorSnapshot;
    delete req.body.warehouseCheck;
    delete req.body.approvalInfo;
    delete req.body.createdBy;

    const updatePayload = {
      ...req.body,
      status: doc.status,
      warehouseCheck: doc.warehouseCheck,
      approvalInfo: doc.approvalInfo,
      vendorSnapshot: doc.vendorSnapshot,
      createdBy: doc.createdBy,
      category: doc.category,
      targetWarehouse: doc.targetWarehouse,
    } as unknown as TypeReportDocument;

    await reportDocumentDAO.validate(updatePayload);

    const result = await ReportDocumentModel.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
      }
    );

    // === TAMBAHAN KODE NOTIFIKASI ===
    // Kirim notifikasi ulang ke PIC Gudang jika BAPB
    if (doc.category === CATEGORY_REPORT_DOCUMENT.BAPB && doc.targetWarehouse) {
      try {
        const company = await CompanyModel.findById(
          doc.vendorSnapshot.companyRefId
        );
        const warehouseUsers = await UserModel.find({
          role: ROLES.PICGUDANG,
          warehouseId: doc.targetWarehouse,
        });

        for (const warehouseUser of warehouseUsers) {
          await NotificationService.notifyWarehouseCheck(
            result,
            warehouseUser,
            company?.companyName || doc.vendorSnapshot.companyName
          );
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }
    }

    response.success(res, result, "Success resubmit a report document");
  },
  //
  // [GANTIKAN FUNGSI verifyByWarehouse DENGAN INI]
  async verifyByWarehouse(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // TERIMA DATA DARI BODY JSON
      const { checkStatus, notes, digitalSignature, images } = req.body;

      await verifyWarehouseValidationSchema.validate(
        { checkStatus, notes },
        { abortEarly: false }
      );

      const validStatuses = Object.values(STATUS_WAREHOUSE_CHECK);
      if (!validStatuses.includes(checkStatus)) {
        return response.error(res, null, "Invalid checkStatus");
      }

      const user = await UserModel.findById(userId);
      if (!user || user.role !== ROLES.PICGUDANG || !user.warehouseId) {
        return response.unauthorized(res, "Unauthorized");
      }

      const warehouse = await WarehouseModel.findById(user.warehouseId);
      if (!warehouse) return response.notFound(res, "Warehouse not found");

      const doc = await ReportDocumentModel.findById(id);
      if (!doc) return response.notFound(res, "Report Document not found");
      if (doc.category !== CATEGORY_REPORT_DOCUMENT.BAPB) return response.error(res, null, "Not BAPB");
      if (doc.status !== STATUS_REPORT_DOCUMENT.PENDING) return response.error(res, null, "Already processed");
      if (doc.targetWarehouse && doc.targetWarehouse.toString() !== warehouse._id.toString()) {
        return response.unauthorized(res, "Wrong Warehouse");
      }

      // Ambil array images dari JSON Body (hasil upload frontend)
      let finalImages: ImageMetaData[] = [];
      if (Array.isArray(images)) {
          finalImages = images;
      }

      const warehouseCheckPayload = {
        warehouseRefId: warehouse._id,
        warehouseName: warehouse.warehouseName,
        checkerRefId: user._id,
        checkerName: user.fullname,
        checkAt: new Date(),
        checkStatus: checkStatus,
        notes: notes,
        images: finalImages, 
        digitalSignature: digitalSignature || "", // AMAN: String JSON tidak akan jadi object {}
      };

      // Update Database
      let updatePayload: any = { warehouseCheck: warehouseCheckPayload };
      if (checkStatus === STATUS_WAREHOUSE_CHECK.REJECTED) {
        updatePayload.status = STATUS_REPORT_DOCUMENT.REJECTED;
      }
      
      const result = await ReportDocumentModel.findByIdAndUpdate(id, updatePayload, { new: true });

      // Notifikasi (Logika Lama - Tidak Berubah)
      try {
        if (checkStatus === STATUS_WAREHOUSE_CHECK.APPROVED) {
          const approvers = await UserModel.find({ role: ROLES.PEMESANBARANG });
          const company = await CompanyModel.findById(doc.vendorSnapshot.companyRefId);
          const docForNotif = { ...result?.toObject(), warehouseCheck: warehouseCheckPayload };
          
          for (const approver of approvers) {
            await NotificationService.notifyApprovalNeeded(
              docForNotif, approver, 
              company?.companyName || doc.vendorSnapshot.companyName, user.fullname
            );
          }
        } else if (checkStatus === STATUS_WAREHOUSE_CHECK.REJECTED) {
          const vendorUser = await UserModel.findById(doc.createdBy);
          if (vendorUser) {
            await NotificationService.notifyDocumentRejected(result, vendorUser, user.fullname, "warehouse");
          }
        }
      } catch (notifError) { console.error("Notification error:", notifError); }

      response.success(res, result, "Success verify by warehouse");
    } catch (error) {
      response.error(res, error, "failed verify by warehouse");
    }
  },
  async approve(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Ambil data dari body
      const { status, notes, digitalSignature } = req.body;

      // --- [VALIDASI LOGIC LAMA - JANGAN DIUBAH] ---
      if (status === STATUS_REPORT_DOCUMENT.PENDING) {
        return response.error(res, null, "Report Document not approved");
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return response.notFound(res, "User not found");
      }
      const doc = await ReportDocumentModel.findById(id);
      if (!doc) {
        return response.notFound(res, "Report Document not found");
      }

      let isAuthorzied = false;

      if (doc.category === CATEGORY_REPORT_DOCUMENT.BAPB) {
        if (user.role === ROLES.PEMESANBARANG) {
          isAuthorzied = true;
        }
      } else if (doc.category === CATEGORY_REPORT_DOCUMENT.BAPP) {
        if (user.role === ROLES.DIREKSIPEKERJAAN) {
          isAuthorzied = true;
        }
      }

      if (!isAuthorzied) {
        return response.unauthorized(res, "unauthorized");
      }

      if (doc.status !== STATUS_REPORT_DOCUMENT.PENDING) {
        return response.badRequest(
          res,
          "Report Document is not pending state for approve"
        );
      }

      if (doc.category === CATEGORY_REPORT_DOCUMENT.BAPB) {
        if (
          !doc.warehouseCheck ||
          doc.warehouseCheck.checkStatus !== STATUS_WAREHOUSE_CHECK.APPROVED
        ) {
          return response.error(
            res,
            null,
            "Report Document is not approved by warehouse"
          );
        }
      }
      // --- [AKHIR VALIDASI LOGIC LAMA] ---

      const isApproved = status === STATUS_REPORT_DOCUMENT.APPROVED;

      // Helper digital signature (asumsi fungsi ini ada di file Anda)
      // const signatureString = isApproved
      //   ? getDigitalSignature(user._id.toString())
      //   : "N/A";



      const updatePayload = {
        status: status,
        approvalInfo: {
          approvalRefId: user._id,
          approvalByName: user.fullname, // Pastikan field ini sesuai model User (fullName vs fullname)
          approveAt: new Date(),
          notes: notes,
          isSigned: isApproved,
          digitalSignature: digitalSignature || "Manual-Approval",
        },
      };

      const result = await ReportDocumentModel.findByIdAndUpdate(
        id,
        updatePayload,
        {
          new: true,
        }
      );

      // --- [UPDATE DI SINI: BAGIAN NOTIFIKASI & EMAIL] ---
      try {
        const vendorUser = await UserModel.findById(doc.createdBy);

        if (vendorUser) {
          // Siapkan Data untuk Email (Hanya jika Approved)
          // Di dalam controller, saat mendefinisikan emailData:
          const emailData = {
            vendorName: vendorUser.fullname || vendorUser.username,
            contractNumber: doc.contractNumber,
            category: doc.category,
            approverName: user.fullname,
            approvedAt: new Date().toLocaleDateString("id-ID"),
            linkDashboard: `${FRONTEND_URL}/ba/${doc._id}`,

            notes: notes // <--- Tambahkan baris ini jika ingin catatan tampil di email
          };

          if (status === STATUS_REPORT_DOCUMENT.APPROVED) {
            // 1. Notifikasi In-App (BAWAAN LAMA - TETAPKAN)
            await NotificationService.notifyDocumentApproved(
              result,
              vendorUser,
              user.fullname
            );

            // 2. Kirim Email Notifikasi (TAMBAHAN BARU)
            if (vendorUser.email) {
              // Gunakan .catch agar jika email gagal, response API tetap sukses
              sendEmailApproved(vendorUser.email, emailData)
                .catch(err => console.error("Gagal kirim email approval:", err));
            }

          } else if (status === STATUS_REPORT_DOCUMENT.REJECTED) {
            // const emai1. Notifikasi In-App (BAWAAN LAMA - TETAPKAN)
            await NotificationService.notifyDocumentRejected(
              result,
              vendorUser,
              user.fullname,
              "approval"
            );

            // Opsi: Jika mau tambah email REJECTED, tambahkan di sini nanti
          }
        }
      } catch (notifError) {
        // Error di notifikasi tidak boleh membatalkan approval dokumen
        console.error("Notification error:", notifError);
      }
      // --- [AKHIR UPDATE] ---

      response.success(res, result, "Success approve a report document");
    } catch (error) {
      response.error(res, error, "failed approve a report document");
    }
  },
};

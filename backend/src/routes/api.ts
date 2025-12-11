import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import { ROLES } from "../utils/constant";
import companyController from "../controllers/company.controller";
import adminController from "../controllers/admin.controller";
import mediaMiddleware from "../middlewares/media.middleware";
import mediaController from "../controllers/media.controller";
import warehouseController from "../controllers/warehouse.controller";
import reportDocumentController from "../controllers/reportDocument.Controller";
import twoFAController from "../controllers/twoFA.controller";

const router = express.Router();

router.post(
  "/auth/register",
  authController.register
);
router.post(
  "/auth/login",
  authController.login
);
router.post(
  "/auth/verify-2fa",
  authController.verifyLogin2FA
);
router.get(
  "/auth/me",
  authMiddleware,
  authController.me
);

router.patch(
  "/auth/update-password",
  [authMiddleware, aclMiddleware([
    ROLES.ADMINISTRATOR,
    ROLES.DIREKSIPEKERJAAN,
    ROLES.PEMESANBARANG,
    ROLES.PICGUDANG,
    ROLES.VENDOR,])
  ],
  authController.updatePassword
);

router.post(
  "/2fa/setup",
  authMiddleware,
  twoFAController.setup2FA
);
router.post(
  "/2fa/verify",
  authMiddleware,
  twoFAController.verify2FA
);
router.post(
  "/2fa/disable",
  authMiddleware,
  twoFAController.disable2FA
);
router.get(
  "/2fa/status",
  authMiddleware,
  twoFAController.get2FAStatus
);

router.post(
  "/company",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.create
);
router.get(
  "/company",
  companyController.findAll
);
router.get(
  "/company/:id",
  companyController.findOne
);
router.put(
  "/company/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.update
);
router.delete(
  "/company/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.remove
);

router.post(
  "/warehouse",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.create
);
router.get(
  "/warehouse",
  warehouseController.findAll
);
router.get(
  "/warehouse/:id",
  warehouseController.findOne
);
router.put(
  "/warehouse/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.update
);
router.delete(
  "/warehouse/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.remove
);

router.post(
  "/report-documents",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.create
);

router.get(
  "/report-documents",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.VENDOR,
      ROLES.DIREKSIPEKERJAAN,
      ROLES.PEMESANBARANG,
      ROLES.PICGUDANG,
    ]),
  ],
  reportDocumentController.findAll
);

router.get(
  "/report-documents/:id",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.VENDOR,
      ROLES.DIREKSIPEKERJAAN,
      ROLES.PEMESANBARANG,
      ROLES.PICGUDANG,
    ]),
  ],
  reportDocumentController.findOne
);

router.patch(
  "/report-documents/:id/resubmit",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.resubmit
);

router.patch(
  "/report-documents/:id/verify",
  authMiddleware, 
  reportDocumentController.verifyByWarehouse
);

router.patch(
  "/report-documents/:id/approve",
  [
    authMiddleware,
    aclMiddleware([ROLES.PEMESANBARANG, ROLES.DIREKSIPEKERJAAN]),
  ],
  reportDocumentController.approve
);

router.delete(
  "/report-documents/:id",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.remove
);

router.get(
  "/admin/users",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.getUser
);

router.delete(
  "/admin/users/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.removeUser);

router.put(
  "/admin/users/:id/assign-role",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.assignRole
);

router.post(
  "/media/upload-single",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.ADMINISTRATOR,
      ROLES.DIREKSIPEKERJAAN,
      ROLES.PEMESANBARANG,
      ROLES.PICGUDANG,
      ROLES.VENDOR,
    ]),
  ],
  mediaMiddleware.single("file"),
  mediaController.single
);
router.post(
  "/media/upload-multiple",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.ADMINISTRATOR,
      ROLES.DIREKSIPEKERJAAN,
      ROLES.PEMESANBARANG,
      ROLES.PICGUDANG,
      ROLES.VENDOR,
    ]),
  ],
  mediaMiddleware.multiple("files"),
  mediaController.multiple
);

export default router;

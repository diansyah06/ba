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
  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RegisterRequest"
    }
  }
  */
);
router.post(
  "/auth/login",
  authController.login
  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/LoginRequest"
    }
  }
  */
);
router.post(
  "/auth/verify-2fa",
  authController.verifyLogin2FA
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Verify 2FA token during login'
  #swagger.requestBody = {
    required: true,
    schema: {
      type: "object",
      properties: {
        tempToken: { type: "string", description: "Temporary token from login" },
        token: { type: "string", description: "6-digit 2FA token" }
      },
      required: ["tempToken", "token"]
    }
  }
  */
);
router.get(
  "/auth/me",
  authMiddleware,
  authController.me
  /*
  #swagger.tags = ['Auth']
  #swagger.secuirty = [{ "bearerAuth": {} }]
  */
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
  /*
   #swagger.tags = ['Auth']
   #swagger.security = [{ "bearerAuth": {} }]
   #swagger.summary = 'Update user password'
   #swagger.requestBody = {
     required: true,
     schema: {
       $ref: "#/components/schemas/UpdatePasswordRequest"
     }
   }
   */
);


router.post(
  "/2fa/setup",
  authMiddleware,
  twoFAController.setup2FA
  /*
  #swagger.tags = ['2FA']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Setup 2FA - Generate QR code'
  #swagger.requestBody = {
    required: true,
    schema: {
      type: "object",
      properties: {
        password: { type: "string", description: "User password for verification" }
      },
      required: ["password"]
    }
  }
  */
);
router.post(
  "/2fa/verify",
  authMiddleware,
  twoFAController.verify2FA
  /*
  #swagger.tags = ['2FA']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Verify and enable 2FA'
  #swagger.requestBody = {
    required: true,
    schema: {
      type: "object",
      properties: {
        token: { type: "string", description: "6-digit 2FA token from authenticator" }
      },
      required: ["token"]
    }
  }
  */
);
router.post(
  "/2fa/disable",
  authMiddleware,
  twoFAController.disable2FA
  /*
  #swagger.tags = ['2FA']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Disable 2FA'
  #swagger.requestBody = {
    required: true,
    schema: {
      type: "object",
      properties: {
        password: { type: "string", description: "User password" },
        token: { type: "string", description: "6-digit 2FA token" }
      },
      required: ["password", "token"]
    }
  }
  */
);
router.get(
  "/2fa/status",
  authMiddleware,
  twoFAController.get2FAStatus
  /*
  #swagger.tags = ['2FA']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Get 2FA status'
  */
);

router.post(
  "/company",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.create
  /*
  #swagger.tags = ['Company']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateCompanyRequest"
    }
  }
  */
);
router.get(
  "/company",
  companyController.findAll
  /*
  #swagger.tags = ['Company']
  */
);
router.get(
  "/company/:id",
  companyController.findOne
  /*
  #swagger.tags = ['Company']
  */
);
router.put(
  "/company/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.update
  /*
  #swagger.tags = ['Company']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateCompanyRequest"
    }
  }
  */
);
router.delete(
  "/company/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  companyController.remove
  /*
  #swagger.tags = ['Company']
  #swagger.security = [{ "bearerAuth": {} }]
  */
);

router.post(
  "/warehouse",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.create
  /*
  #swagger.tags = ['Warehouse']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateWarehouseRequest"
    }
  }
  */
);
router.get(
  "/warehouse",
  warehouseController.findAll
  /*
  #swagger.tags = ['Warehouse']
  */
);
router.get(
  "/warehouse/:id",
  warehouseController.findOne
  /*
  #swagger.tags = ['Warehouse']
  */
);
router.put(
  "/warehouse/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.update
  /*
  #swagger.tags = ['Warehouse']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateWarehouseRequest"
    }
  }
  */
);
router.delete(
  "/warehouse/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  warehouseController.remove
  /*
  #swagger.tags = ['Warehouse']
  #swagger.security = [{ "bearerAuth": {} }]
  */
);

router.post(
  "/report-documents",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.create
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/CreateReportDocumentRequest" }
  }
  */
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
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.parameters['page'] = { in: 'query', type: 'number' }
  #swagger.parameters['limit'] = { in: 'query', type: 'number' }
  #swagger.parameters['search'] = { in: 'query', type: 'string' }
  #swagger.parameters['category'] = { in: 'query', type: 'string' }
  #swagger.parameters['status'] = { in: 'query', type: 'string' }
  */
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
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  */
);

router.patch(
  "/report-documents/:id/resubmit",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.resubmit
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Resubmit document after rejection or revision'
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/ResubmitReportDocumentRequest" }
  }
  */
);

router.patch(
  "/report-documents/:id/verify",
  [authMiddleware, aclMiddleware([ROLES.PICGUDANG])],
  mediaMiddleware.multiple("images"),
  reportDocumentController.verifyByWarehouse
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Verify physical goods with optional images (BAPB Only)'
  #swagger.consumes = ['multipart/form-data']
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            checkStatus: {
              type: "string",
              enum: ["approved", "rejected"],
              description: "Warehouse check status"
            },
            notes: {
              type: "string",
              description: "Verification notes"
            },
            images: {
              type: "array",
              items: {
                type: "string",
                format: "binary"
              },
              description: "Optional verification images (max 5 images, 5MB each)"
            }
          },
          required: ["checkStatus", "notes"]
        }
      }
    }
  }
  */
);

router.patch(
  "/report-documents/:id/approve",
  [
    authMiddleware,
    aclMiddleware([ROLES.PEMESANBARANG, ROLES.DIREKSIPEKERJAAN]),
  ],
  reportDocumentController.approve
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.summary = 'Final Approval'
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/ApproveReportDocumentRequest" }
  }
  */
);

router.delete(
  "/report-documents/:id",
  [authMiddleware, aclMiddleware([ROLES.VENDOR])],
  reportDocumentController.remove
  /*
  #swagger.tags = ['Report Document']
  #swagger.security = [{ "bearerAuth": {} }]
  */
);

router.get(
  "/admin/users",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.getUser
  /*
  #swagger.tags = ['Admin']
  #swagger.security = [{ "bearerAuth": {} }]
  */
);

router.delete(
  "/admin/users/:id",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.removeUser
/*
#swagger.tags = ['Admin']
#swagger.security = [{ "bearerAuth": {} }]
#swagger.summary = 'Delete a user by ID'
#swagger.parameters['id'] = { in: 'path', type: 'string', description: 'User ID' }
*/)

router.put(
  "/admin/users/:id/assign-role",
  [authMiddleware, aclMiddleware([ROLES.ADMINISTRATOR])],
  adminController.assignRole
  /*
  #swagger.tags = ['Admin']
  #swagger.security = [{ "bearerAuth": {} }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/AssignRoleRequest"
    }
  }
  */
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
  /*
#swagger.tags = ['Media']
#swagger.security = [{ "bearerAuth": {} }]
#swagger.requestBody = {
    required: true,
    content: {
        "multipart/form-data": {
            schema: {
                type: "object",
                properties: {
                    file: {
                        type: "string",
                        format: "binary",
                    }
                }
            }
        }
    }
}
*/
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
  /*
#swagger.tags = ['Media']
#swagger.security = [{ "bearerAuth": {} }]
#swagger.requestBody = {
    required: true,
    content: {
        "multipart/form-data": {
            schema: {
                type: "object",
                properties: {
                    files: {
                        type: "array",
                        items: {
                            type: "string",
                            format: "binary"
                        }
                    }
                }
            }
        }
    }
}
*/
);

export default router;

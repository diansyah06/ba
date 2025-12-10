import swaggerAutogen from "swagger-autogen";
import { STATUS_WAREHOUSE_CHECK } from "../utils/constant";

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];
const doc = {
  info: {
    version: "1.0.0",
    title: "Dokumentasi API Backend Asah",
    description: "Dokumentasi API Backend Asah",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local server",
    },
    {
      url: "https://back-end-asah.vercel.app/api",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      RegisterRequest: {
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      LoginRequest: {
        identifier: "",
        password: "",
      },
      UpdatePasswordRequest: {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      CreateCompanyRequest: {
        companyName: "",
        companyAddress: "",
        picName: "",
        status: "",
      },
      CreateWarehouseRequest: {
        warehouseName: "",
        warehouseAddress: "",
        status: "",
      },
      AssignRoleRequest: {
        role: "",
        vendorId: "",
        warehouseId: "",
      },
      CreateReportDocumentRequest: {
        category: "",
        contractNumber: "",
        paymentNominal: 0,
        description: "",
        targetWarehouse: "",
      },
      ResubmitReportDocumentRequest: {
        contractNumber: "",
        paymentNominal: 0,
        description: "",
      },
      VerifyWarehouseRequest: {
        type: "object",
        properties: {
          checkStatus: {
            type: "string",
            enum: [
              STATUS_WAREHOUSE_CHECK.PENDING.toLowerCase(),
              STATUS_WAREHOUSE_CHECK.APPROVED.toLowerCase(),
              STATUS_WAREHOUSE_CHECK.REJECTED.toLowerCase(),
            ],
            description: "Warehouse check status",
          },
          notes: {
            type: "string",
            description: "Warehouse check notes",
          },
          images: {
            type: "array",
            items: {
              type: "string",
              format: "binary",
            },
            description:
              "Optional verification images (max 5 images, 5MB each)",
          },
        },
        required: ["checkStatus", "notes"],
      },
      ApproveReportDocumentRequest: {
        status: "",
        notes: "",
      },
    },
  },
};

swaggerAutogen({
  openapi: "3.0.0",
})(outputFile, endpointsFiles, doc);

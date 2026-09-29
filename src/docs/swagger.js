import swaggerUi from "swagger-ui-express";
import { env } from "../config/env.js";
const spec = {
  openapi: "3.0.0",
  info: { title: "Personal Finance Tracker API", version: "1.0.0" },
  servers: [{ url: env.API_URL }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Abdullahi" },
          email: { type: "string", format: "email", example: "abdullahi@example.com" },
          password: { type: "string", format: "password", example: "Password123!" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "abdullahi@example.com" },
          password: { type: "string", format: "password", example: "Password123!" },
        },
      },
      TransactionRequest: {
        type: "object",
        required: ["title", "amount", "type", "category", "date"],
        properties: {
          title: { type: "string", example: "Groceries" },
          amount: { type: "number", example: 50 },
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          category: { type: "string", example: "Food" },
          date: { type: "string", format: "date", example: "2026-09-29" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: { 201: { description: "Registered" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: { 200: { description: "Logged in" } },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Profile" } },
      },
    },
    "/transactions": {
      get: {
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Transactions" } },
      },
      post: {
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransactionRequest" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/transactions/monthly-summary": {
      get: {
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Summary" } },
      },
    },
    "/transactions/{id}": {
      put: {
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            description: "MongoDB transaction ObjectId",
            schema: {
              type: "string",
              example: "68db123456789abcdef12345",
            },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransactionRequest" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: { tags: ["Transactions"], security: [{ bearerAuth: [] }] },
    },
    "/categories": {
      get: { tags: ["Categories"], security: [{ bearerAuth: [] }] },
    },
    "/upload/profile-picture": {
      post: {
        tags: ["Upload"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { type: "object", required: ["profilePicture"], properties: { profilePicture: { type: "string", format: "binary" } } },
            },
          },
        },
      },
    },
    "/admin/overview": {
      get: { tags: ["Admin"], security: [{ bearerAuth: [] }] },
    },
  },
};
export const swagger = (app) =>
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

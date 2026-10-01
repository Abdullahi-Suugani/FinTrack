import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { overview } from "../controllers/admin.controller.js";
const r = Router();
r.get("/overview", authenticate, requireAdmin, overview);
export default r;

import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../controllers/upload.controller.js";
const r = Router();
const m = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
});
r.post("/profile-picture", authenticate, m.single("profilePicture"), upload);
export default r;

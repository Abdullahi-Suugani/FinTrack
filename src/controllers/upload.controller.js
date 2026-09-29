import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import { env } from "../config/env.js";
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});
export async function upload(req, res, next) {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    if (!env.CLOUDINARY_CLOUD_NAME)
      return res
        .status(503)
        .json({ success: false, message: "Cloudinary is not configured" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "personal-finance-profiles", resource_type: "image" },
        (e, r) => (e ? reject(e) : resolve(r)),
      );
      stream.end(req.file.buffer);
    });
    await User.findByIdAndUpdate(req.user._id, {
      profilePicture: result.secure_url,
    });
    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: result.secure_url,
    });
  } catch (e) {
    next(e);
  }
}

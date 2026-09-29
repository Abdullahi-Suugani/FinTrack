import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
export async function authenticate(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer "))
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const p = jwt.verify(h.slice(7), env.JWT_SECRET);
    const user = await User.findById(p.userId).select("-password");
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid token" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

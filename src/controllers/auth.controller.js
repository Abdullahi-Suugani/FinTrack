import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
const safe = (u) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  profilePicture: u.profilePicture,
});
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    const u = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful",
        data: safe(u),
      });
  } catch (e) {
    next(e);
  }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body,
      u = await User.findOne({ email });
    if (!u || !(await bcrypt.compare(password, u.password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    res.json({
      success: true,
      message: "Login successful",
      token: signToken(u),
      user: safe(u),
    });
  } catch (e) {
    next(e);
  }
}
export const profile = (req, res) =>
  res.json({ success: true, data: req.user });

export const requireAdmin = (req, res, next) =>
  req.user?.role === "ADMIN"
    ? next()
    : res
        .status(403)
        .json({ success: false, message: "Admin access required" });

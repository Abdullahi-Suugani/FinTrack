export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res
    .status(status)
    .json({
      success: false,
      message:
        status === 500 && process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : err.message || "Something went wrong",
    });
};

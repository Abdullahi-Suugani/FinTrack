export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success)
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        });
    // Express exposes req.query through a getter. Keep validated query data
    // separately instead of assigning to req.query.
    if (source === "query") req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };

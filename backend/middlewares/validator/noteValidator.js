const allowedFields = ["text"];
const serverManagedFields = ["id", "created_at", "updated_at"];

const validateNoteBody = (req, res, next) => {
  const fields = Object.keys(req.body);
  const suppliedServerManagedFields = fields.filter((field) =>
    serverManagedFields.includes(field)
  );

  if (suppliedServerManagedFields.length > 0) {
    return res.status(400).json({
      error: `${suppliedServerManagedFields.join(", ")} cannot be set through the API`,
    });
  }

  const unknownFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    return res.status(400).json({
      error: `Unknown note field: ${unknownFields.join(", ")}`,
    });
  }

  if (typeof req.body.text !== "string" || req.body.text.trim() === "") {
    return res.status(400).json({
      error: "Note text is required",
    });
  }

  req.body.text = req.body.text.trim();
  next();
};

module.exports = validateNoteBody;

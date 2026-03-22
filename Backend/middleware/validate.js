const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Zod gives us detailed field-level errors — format them cleanly
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Attach the validated + sanitised data to req so controllers
  // never touch raw req.body — they only use req.validatedData
  req.validatedData = result.data;
  next();
};

module.exports = validate;
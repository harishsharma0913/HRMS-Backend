const { z } = require('zod');

const designationSchema = z.object({
  name: z.string().min(2, 'Designation name must be at least 2 characters'),
  department_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID')
});

const validateDesignation = (req, res, next) => {
  const result = designationSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      path: err.path[0],
      message: err.message
    }));

    return res.status(400).json({status:false, error:errors });
  }

  req.body = result.data;
  next();
};

module.exports = validateDesignation;

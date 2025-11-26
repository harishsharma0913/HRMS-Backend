const { z } = require("zod");

const createJobSchema = z.object({
  title: z.string().nonempty("Title is required"),
  department: z.string().nonempty("Department is required"),
  location: z.string().nonempty("Location is required"),
  experience: z.enum(["Fresher", "1-3 years", "3-5 years", "5+ years"]).default("Fresher"),
  minSalary: z
    .number({ invalid_type_error: "Minimum Salary must be a number" })
    .min(0, "Minimum Salary must be greater than 0"),
  maxSalary: z
    .number({ invalid_type_error: "Maximum Salary must be a number" })
    .min(0, "Maximum Salary must be greater than 0"),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters"),
});

const validateCreateJob = (req, res, next) => {
  try {
    if (req.body.minSalary) req.body.minSalary = Number(req.body.minSalary); 
    if (req.body.maxSalary) req.body.maxSalary = Number(req.body.maxSalary); 
    createJobSchema.parse(req.body); 
    next();
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: err.errors.map((e) => e.message),
    });
  }
};

module.exports = { validateCreateJob };

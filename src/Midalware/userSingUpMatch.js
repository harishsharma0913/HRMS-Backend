const { z } = require("zod");

// 1. Common base schema
const baseEmployeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  personalEmail: z
    .string()
    .email("Invalid personal email")
    .min(1, "Personal email is required"),
  officialEmail: z.string().email("Invalid official email").optional(),
  phoneNo: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password is required"),
  dob: z.coerce.date({ errorMap: () => ({ message: "DOB is required" }) }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], {
    message: "Blood group is required",
  }),
  doj: z.coerce.date().optional(),
  address: z
    .string()
    .min(5, "Enter a valid Address")
    .max(200, "Address must be less than 200 characters"),
  isActive: z
    .string()
    .optional(),
  experience: z
    .array(
      z.object({
        companyName: z.string().optional(),
        designation_1: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .optional(),
  bankDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    branchName: z.string().min(1, "Branch name is required"),
  }),
});

// 2. Create schema = required
const createSchema = baseEmployeeSchema;

// 3. Update schema = all optional
const updateSchema = baseEmployeeSchema.partial();

// 4. Middleware
const validateEmployee = (isUpdate = false) => (req, res, next) => {
  try {
    console.log("Validating employee data:", req.body);
    if (req.body.bankDetails && typeof req.body.bankDetails === "string") {
      req.body.bankDetails = JSON.parse(req.body.bankDetails);
    }

    const schema = isUpdate ? updateSchema : createSchema;
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        message: err.message,
      }));
      return res
        .status(400)
        .send({ status: false, message: errors[0].message });
    }

    req.validatedData = result.data;
    next();
  } catch (err) {
    console.error("Validation middleware error:", err);
    return res.status(400).json({
      status: false,
      message: err || "Validation error",
    });
  }
};

module.exports = validateEmployee;

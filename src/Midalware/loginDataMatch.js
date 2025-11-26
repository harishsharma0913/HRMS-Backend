const { z } = require('zod');

const emailSchema = z.object({
  email: z.string().email({status:false, message: 'Invalid email address format' }),
  password: z
    .string()
    .min(6, {status:false, message: "Enter password minimum 6 characters" })
});

const validData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({status:false, message: "Fill in email input fields" });
  }
  if (!password) {
    return res.status(400).send({status:false, message: "Fill in password input fields" });
  }

  const result = emailSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      message: err.message
    }));
    return res.status(400).send({status:false, message: errors[0].message});
  }

  req.validatedData = result.data;

  next();
};

module.exports = validData;

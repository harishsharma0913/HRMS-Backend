const { z } = require('zod');

const supportTicketSchema = z.object({
  subject: z
    .string({ message: 'Enter a String value for subject' })
    .max(10, { message: 'Subject must be at most 10 characters' }),
  description: z
    .string({ message: 'Enter a String value for description' })
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(100, { message: 'Description must be at most 100 characters' })
});

const validateSupportTicket = (req, res, next) => {
    const { subject, description } = req.body;
    if (!subject) {
        return res.status(400).send({ status: false, message: 'Fill in subject field' });
    }
    if (!description) {
        return res.status(400).send({ status: false, message: 'Fill in description field' });
    }
  const result = supportTicketSchema.safeParse(req.body);  

  if (!result.success) {
    const errorMessage = result.error.errors[0].message;
    return res.status(400).send({ status: false, message: errorMessage });
  }

  req.validatedData = result.data;
  next();
};

module.exports = validateSupportTicket;

const { z } = require("zod");
const mongoose = require("mongoose");

// ObjectId Validation
const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid employee ID" }
);

// Regex patterns
const titlePattern = /^[A-Za-z0-9\s.\-_]+$/;
const descriptionPattern = /^[A-Za-z0-9\s.\,\-_!?]+$/;

const notOnlyNumbers = (value) => !/^\d+$/.test(value);

const addTaskSchema = z.object({
  title: z
    .string({
      required_error: "Task title is required",
    })
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters")
    .refine(notOnlyNumbers, "Title cannot be only numbers")
    .refine((val) => titlePattern.test(val), {
      message: "Title contains invalid characters",
    }),

  description: z
    .string({
      required_error: "Task description is required",
    })
    .min(3, "Description must be at least 3 characters")
    .max(2000, "Description too long")
    .refine(notOnlyNumbers, "Description cannot be only numbers")
    .refine((val) => descriptionPattern.test(val), {
      message: "Description contains invalid characters",
    }),

  assignTo: objectId,

  dueDate: z
    .string({
      required_error: "Due date is required",
    })
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Due date cannot be in the past"),

  priority: z.enum(["Low", "Medium", "High"], {
    required_error: "Priority is required",
  }),

});

// Middleware
const validateAddTask = (req, res, next) => {
  console.log("hiiiiiiiiiiiiiiiiiiii");
  
  try {
    addTaskSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.errors?.[0]?.message || "Invalid task data",
    });
  }
};

module.exports = validateAddTask;

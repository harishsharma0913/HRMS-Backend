const express = require('express');
const { employeeLogin, logout } = require('../Controllers/employeeLogin');
const loginDataMatch = require('../Midalware/loginDataMatch');
const { verifyToken, isEmployee } = require('../Midalware/authMiddleware');
const { getMyProfile } = require('../Controllers/employeeController');
const { applyLeave, getMyLeaves, updateLeaveStatus } = require('../Controllers/leaveController');
const validateSupportTicket = require('../Midalware/supportTicketValidator');
const { createSupportTicket, getTickets } = require('../Controllers/supportTicketController');
const uploadImage = require('../Midalware/uploadImage');
const { getMyTasks, updateTask } = require('../Controllers/taskController');
const { sendOtp, verifyOtp, resetPassword } = require('../Controllers/resetPassword');


const userRouter = express.Router();

userRouter.post('/', loginDataMatch, employeeLogin);
userRouter.post("/logout", logout);

// 🔓 Public Routes (No Login Required)
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);

userRouter.get('/employee/me', verifyToken, isEmployee, getMyProfile);
userRouter.post('/leave',verifyToken, isEmployee, applyLeave);
userRouter.get('/leave/:id', verifyToken, isEmployee, getMyLeaves);
userRouter.patch('/leave/:id', verifyToken, isEmployee, updateLeaveStatus);
userRouter.post('/ticket/:id', verifyToken, isEmployee, uploadImage.single('attachments'), validateSupportTicket, createSupportTicket);
userRouter.get('/ticket/:id', verifyToken, isEmployee, getTickets);
userRouter.get('/tasks', verifyToken, isEmployee, getMyTasks);
userRouter.put('/tasks/:id', verifyToken, isEmployee, updateTask);

module.exports = userRouter;
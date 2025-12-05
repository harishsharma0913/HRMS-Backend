const express = require('express');
const validData = require('../Midalware/loginDataMatch');
const {addEmployee, getEmployee, updateEmployeeProfileImage, updateEmployeePassword, updateEmployee, deleteEmployee} = require('../Controllers/userSingUpApi');
const validateEmployee = require('../Midalware/userSingUpMatch');
const validateDepartment = require('../Midalware/departmentValidation');
const uploadImage = require('../Midalware/uploadImage');
const {addDepartment, getDepartment, updateDepartment, deleteDepartment}  = require('../Controllers/departmentApi');
const {addDesignation, getAllOrByDepartment, updateDesignation, deleteDesignation} = require('../Controllers/designationApi');
const validateDesignation = require('../Midalware/designationValidation');
const {loginAdmin, adminLogout} = require('../Controllers/adminLoginApi');
const { updateLeaveStatus, getFilteredLeavesAdmin, getAllLeavesAdmin, addComment } = require('../Controllers/leaveController');
const { getAllTickets, getFilteredTickets, updateTicketStatus, getTicketById } = require('../Controllers/supportTicketController');
const { createJob, getJobs, updateJob, createJobApplication } = require('../Controllers/addJobController');
const { validateCreateJob } = require('../Midalware/jobvalidation');
const { createTask, getAllTasks, deleteTask } = require('../Controllers/taskController');
const validateAddTask = require('../Midalware/addTaskValidator');

const router = express.Router();


router.post('/admin', validData, loginAdmin);
router.post('/logout', adminLogout);
router.post(
  '/employee',
  uploadImage.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'marksheets_ten', maxCount: 1 },
    { name: 'marksheets_twel', maxCount: 1 },
    { name: 'marksheets_ug', maxCount: 1 },
    { name: 'marksheets_pg', maxCount: 1 }
  ]), 
  validateEmployee(), 
  addEmployee
);
router.patch("/update-profile-image/:id", uploadImage.single("profileImage"), updateEmployeeProfileImage);
router.patch("/update-password/:id", updateEmployeePassword);
router.patch('/employee/:id',validateEmployee(true),updateEmployee);
router.patch('/employee/delete/:id', deleteEmployee);
router.get("/employee", getEmployee);
router.get("/employee/:id", getEmployee);

router.post('/department',validateDepartment,addDepartment);
router.get('/department',getDepartment);
router.patch('/department/:id',validateDepartment,updateDepartment);
router.delete('/department/:id', deleteDepartment);

router.post('/designation',validateDesignation,addDesignation);
router.get('/designation',getAllOrByDepartment);
router.patch('/designation/:id',validateDesignation,updateDesignation);
router.delete('/designation/:id', deleteDesignation);

router.get('/admin/leaves',getAllLeavesAdmin );
router.get('/admin/filteredleaves',getFilteredLeavesAdmin);
router.patch('/admin/leave/:id',updateLeaveStatus);
router.post('/admin/:id/comment', addComment);
router.get('/admin/ticket', getAllTickets);
router.get('/admin/ticket/:id', getTicketById);
router.get('/admin/filtered-ticket', getFilteredTickets);
router.patch('/admin/ticket/:id/status', updateTicketStatus);
router.post('/admin/create-job', validateCreateJob, createJob);
router.get('/admin/jobs', getJobs);
router.patch('/admin/job/:id', updateJob);
router.post('/apply', createJobApplication)
router.post('/admin/tasks', validateAddTask, createTask);
router.get('/admin/tasks', getAllTasks);
router.delete('/admin/tasks/:id', deleteTask);

module.exports = router;
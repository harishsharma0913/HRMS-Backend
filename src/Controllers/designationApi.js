const Designation = require("../Models/designationSchema");
const Department = require("../Models/departmentSchema");
const userModel = require("../Models/userSingUpSchema");

const getAllOrByDepartment  = async (req, res) => {
  try {
    const { department_id } = req.query;

    const filter = department_id ? { department_id } : {};

    const designations = await Designation.find(filter).populate('department_id', 'name');

    if (!designations.length) {
      return res.status(404).json({
        status: false,
        message: department_id
          ? 'No designations found for this department'
          : 'No designations found',
      });
    }

    return res.status(200).json({
      status: true,
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const addDesignation = async (req, res) => {
  try {
    const { name, department_id } = req.body;

    const department = await Department.findById(department_id);
    if (!department) {
      return res.status(404).json({
        status: false,
        error: 'Department not found',
      });
    }

    const designation = await Designation.create({ name, department_id });

    return res.status(201).json({
      status: true,
      message: 'Designation created successfully',
      designation,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;              // /designation/update/:id
    const { name, department_id } = req.body;

    // If department_id provided, validate it
    if (department_id) {
      const dept = await Department.findById(department_id);
      if (!dept) {
        return res.status(404).json({
          status: false,
          message: "Department not found",
        });
      }
    }

    const updated = await Designation.findByIdAndUpdate(
      id,
      { name, department_id },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Designation updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobExists = await userModel.findOne({ designation: id });

    if (jobExists) {
      return res.status(400).json({
        status: false,
        message: "This designation is already in use in Employee.",
      });
    }


    const deletedItem = await Designation.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        status: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrByDepartment,
  addDesignation,
  updateDesignation,
  deleteDesignation
};

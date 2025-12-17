const userModel = require("../Models/userSingUpSchema");
const bcrypt = require("bcrypt");
const generateEmployeeId = require("../Utils/generateEmployeeId");

const validateExperienceDates = (experience) => {
  for (let i = 0; i < experience.length; i++) {
    const { from, to } = experience[i];
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (fromDate > toDate) {
        return {
          valid: false,
          message: `Experience entry ${i + 1}: 'From' date must be before 'To' date.`,
        };
      }
    }
  }
  return { valid: true };
};

const addEmployee = async (req, res) => {
  try {
    const employeeId = generateEmployeeId();
    const data = req.body;
    const files = req.files;

    // ✅ DOB validation: must be 18+
    const dobDate = new Date(data.dob);
    const today = new Date();
    const minDOB = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    if (dobDate > minDOB) {
      return res.status(400).json({
        status: false,
        message: "Employee must be at least 18 years old",
      });
    }

    // ✅ Parse experience and bankDetails
    let experience = [];
    let bankDetails = {};

    try {
      experience = typeof data.experience === "string" ? JSON.parse(data.experience) : data.experience;
      bankDetails = typeof data.bankDetails === "string" ? JSON.parse(data.bankDetails) : data.bankDetails;
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: "Invalid JSON format in experience or bankDetails",
      });
    }

    // ✅ Validate experience dates
    const experienceValidation = validateExperienceDates(experience);
    if (!experienceValidation.valid) {
      return res.status(400).json({
        status: false,
        message: experienceValidation.message,
      });
    }

    // ✅ Construct documents object
    const documents = {
      profileImage: files?.profileImage?.[0]?.filename || "",
      aadhar: files?.aadhar?.[0]?.filename || "",
      pan: files?.pan?.[0]?.filename || "",
      marksheets: {
        ten: files?.marksheets_ten?.[0]?.filename || "",
        twel: files?.marksheets_twel?.[0]?.filename || "",
        ug: files?.marksheets_ug?.[0]?.filename || "",
        pg: files?.marksheets_pg?.[0]?.filename || "",
      },
    };

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ✅ Create employee
    const newEmployee = await userModel.create({
      employeeId: employeeId,
      fullName: data.fullName,
      personalEmail: data.personalEmail,
      officialEmail: data.officialEmail,
      phoneNo: data.phoneNo,
      password: hashedPassword,
      dob: data.dob,
      bloodGroup: data.bloodGroup,
      doj: data.doj,
      designation: data.designation,
      address: data.address,
      isActive: data.isActive,
      documents,
      experience,
      bankDetails,
    });

    return res.status(201).json({
      status: true,
      message: "Employee created successfully",
      data: newEmployee,
    });

  } catch (err) {
    // ✅ Handle duplicate email error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: false,
        message: `Employee with this ${duplicateField} already exists.`,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server error while creating employee",
      error: err.message,
    });
  }
};

const getEmployee = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      const employee = await userModel.findById(id)
        .populate({
          path: 'designation',
          populate: { path: "department_id", select: "name" }
        });

      if (!employee) {
        return res.status(404).send({
          status: false,
          message: "Employee not found",
        });
      }

      return res.status(200).send({
        status: true,
        message: "Employee fetched successfully",
        data: {
          ...employee._doc,
          designation: {
            _id: employee.designation._id,
            name: employee.designation.name,
            department: {
              _id: employee.designation.department_id._id,
              name: employee.designation.department_id.name
            }
          }
        }
      });
    } else {
      const employees = await userModel.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'designation',
          populate: { path: 'department_id', model: 'Department' }
        });

      const formatted = employees.map(emp => ({
        ...emp._doc,
        designation: {
          name: emp.designation.name,
          department: {
            _id: emp.designation.department_id._id,
            name: emp.designation.department_id.name
          }
        }
      }));

      return res.status(200).send({
        status: true,
        message: "All employees fetched successfully",
        data: formatted
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

const uploadEmployeeDocument = async (req, res) => {
  const { id } = req.params;
  const { key } = req.body; // 👈 dynamic field
  const file = req.file?.filename;

  if (!file || !key) {
    return res.status(400).json({ message: "File or key missing" });
  }

  try {
    const employee = await userModel.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 🔥 Dynamic key handling
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      employee.documents[parent] = employee.documents[parent] || {};
      employee.documents[parent][child] = file;
    } else {
      employee.documents[key] = file;
    }

    await employee.save();

    res.status(200).json({
      message: "Document uploaded successfully",
      documentKey: key,
      file,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmployeePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const employee = await userModel.findById(id);
    if (!employee) return res.status(404).json({ status: false, message: "Employee not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let updateFields = {};
    
    // Update basic fields if present
    if (data.fullName) updateFields.fullName = data.fullName;
    if (data.personalEmail) updateFields.personalEmail = data.personalEmail;
    if (data.phoneNo) updateFields.phoneNo = data.phoneNo;
    if (data.address) updateFields.address = data.address;
    if (data.designation) updateFields.designation = data.designation;
    // if (data.isActive) updateFields.isActive = data.isActive;
    if (typeof data.isActive !== "undefined") {
     updateFields.isActive = data.isActive;
     }
    // Handle bankDetails (stringified JSON or object)
    if (data.bankDetails) {
      try {
        const bankDetails = typeof data.bankDetails === "string"
          ? JSON.parse(data.bankDetails)
          : data.bankDetails;
        updateFields.bankDetails = bankDetails;
      } catch (err) {
        return res.status(400).send({
          status: false,
          message: "Invalid JSON format in bankDetails",
        });
      }
    }
    
    const updatedEmployee = await userModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).send({
        status: false,
        message: "Employee not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });

  } catch (error) {
    // if (error.code === 11000) {
    //   const field = Object.keys(error.keyValue)[0];
    //   return res.status(400).send({
    //     status: false,
    //     message: `User ${field} already exists.`,
    //   });
    // }
    if (err.code === 11000 && err.keyValue) {
     const field = Object.keys(err.keyValue)[0];
     return res.status(400).send({
     status: false,
     message: `User ${field} already exists.`,
    });
     }
    return res.status(500).send({
      status: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }

};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEmployee = await userModel.findByIdAndUpdate(
      id,
      { status: false, isActive: "InActive"},
      { new: true }
    );

    if (!deletedEmployee) {
      return res.status(404).json({ status: false, message: "Employee not found." });
    }

    res.status(200).json({
      status: true,
      message: "Employee deleted (status set to false) successfully.",
      data: deletedEmployee
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete employee.",
      error: error.message,
    });
  }
};


module.exports = {
  addEmployee,
  getEmployee,
  uploadEmployeeDocument,
  updateEmployeePassword,
  updateEmployee,
  deleteEmployee
};

const userModel = require("../Models/userSingUpSchema");

const getMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await userModel.findById(employeeId)
      .populate({
        path: 'designation',
        populate: { path: 'department_id', select: 'name' }
      });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee profile not found"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: {
        ...employee._doc,
        designation: {
          _id: employee.designation._id,
          name: employee.designation.name,
          department: {
            name: employee.designation.department_id.name
          }
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { getMyProfile };

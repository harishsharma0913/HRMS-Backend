const Department = require("../Models/departmentSchema");
const Designation = require("../Models/designationSchema");
const JobPost = require("../Models/jobPostSchema");

const addDepartment = async (req, res) => {
  const  {name, description}  = req.body;

  try {
    const newDepartment = await Department.create({ name, description });

    res.status(201).json({
      status: true,
      message: 'Department created successfully',
      department: newDepartment
    });
  } catch (err) {
    res.status(500).json({
      status:false,
      message: err.message
    });
  }
};

const getDepartment = async(req,res) =>{
   try {
    const department = await Department.find();

    res.status(200).json({status:true,data:department});
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({status:false, error: 'Internal server error' });
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;        // /department/:id
  const { name, description } = req.body;

  try {
    const updatedDep = await Department.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }                 // return updated document
    );

    if (!updatedDep) {
      return res.status(404).json({ status: false, message: "Department not found" });
    }

    res.status(200).json({
      status: true,
      message: "Department updated successfully",
      data: updatedDep
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    // JOBS me use ho rha?  
    const jobExists = await JobPost.findOne({ department: id });

    // EMPLOYEES me use ho rha?
    const DesignationExists = await Designation.findOne({ department_id: id });

    if (jobExists) {
      return res.status(400).json({
        status: false,
        message: "This department is already in use in Jobs.",
      });
    }
    if (DesignationExists) {
      return res.status(400).json({
        status: false,
        message: "This department is already in use in Designations.",
      });
    }


    const deletedDep = await Department.findByIdAndDelete(id);

    if (!deletedDep) {
      return res.status(404).json({ status: false, message: "Department not found" });
    }

    res.status(200).json({
      status: true,
      message: "Department deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


module.exports =  {addDepartment,getDepartment, updateDepartment, deleteDepartment} ;
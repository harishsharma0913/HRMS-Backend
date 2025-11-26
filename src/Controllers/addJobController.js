const jobApplication = require("../Models/jobApplicationSchema");
const JobPost = require("../Models/jobPostSchema");

const createJob = async (req, res) => {    
    
    try {
      const { title, department, location, experience, minSalary, maxSalary, description } = req.body;
    const job = await JobPost.create({
      title,
      department,
      location,
      experience,
      salary: `${minSalary} - ${maxSalary}`,
      description,
    });

    res.status(201).json({
      status: true,
      message: "Job Created Successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 5,
      search = "",
      status = "",
      department = "",
      startDate = "",
      endDate = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }
    
    if (department) {
      query.department = department;
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59);
        query.createdAt.$lte = end;
      }
    }

    const total = await JobPost.countDocuments(query);

    const jobs = await JobPost.find(query)
      .populate("department", "name description")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      status: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, experience, minSalary, maxSalary, description, status } = req.body;

    const updatedFields = {};

    if (title) updatedFields.title = title;
    if (department) updatedFields.department = department;
    if (experience) updatedFields.experience = experience;
    if (description) updatedFields.description = description;
    if (status !== undefined) updatedFields.status = status;

    if (minSalary && maxSalary) {
      updatedFields.salary = `${minSalary} - ${maxSalary}`;
    }

    const job = await JobPost.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        status: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const createJobApplication = async (req, res) => {
  try {
    const {
      profileAppliedFor,
      fullName,
      email,
      phoneNumber,
      portfolioLink,
      experience,
      currentLocation,
      motivation,
      resumeUrl,
      appliedFor,
    } = req.body;

    // 🔍 Basic manual validation (optional)
    if (!profileAppliedFor || !fullName || !email || !phoneNumber || !experience || !currentLocation || !resumeUrl || !appliedFor) {
      return res.status(400).json({
        status: false,
        message: "All required fields must be filled properly.",
      });
    }

    // 🔍 Optional: Check duplicate application (same email for same job)
    const isAlreadyApplied = await jobApplication.findOne({ email, appliedFor });
    if (isAlreadyApplied) {
      return res.status(400).json({
        status: false,
        message: "You have already applied for this job.",
      });
    }

    // 📌 Create Application
    const newApplication = await jobApplication.create({
      profileAppliedFor,
      fullName,
      email,
      phoneNumber,
      portfolioLink,
      experience,
      currentLocation,
      motivation,
      resumeUrl,
      appliedFor,
    });

    return res.status(201).json({
      status: true,
      message: "Application submitted successfully!",
      data: newApplication,
    });

  } catch (error) {
    console.error("APPLICATION ERROR:", error);

    // Mongoose Validation Error Response
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Something went wrong. Try again later.",
    });
  }
};


module.exports = { createJob, getJobs, updateJob, createJobApplication };
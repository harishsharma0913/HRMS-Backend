const Leave = require('../Models/leaveSchema');
const mongoose = require('mongoose');

// POST: Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, duration } = req.body;
    const employeeId = req.user.id; // from auth middleware

    const newLeave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      duration: duration || "Full Day", // default to Full Day if not provided
      reason,
    });

    res.status(201).json({status:true, message: "Leave applied successfully", leave: newLeave});
  } catch (error) {
    res.status(500).json({status:false, message: error.message });
  }
};

// GET: Get all (filtered) leaves for employee
exports.getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { status, type, from, to } = req.query;

    const filter = { employee: employeeId,
      status: { $ne: "Cancelled" },
     };

    // Apply filters if provided
    if (status && status !== "All") {
      filter.status = status;
    }

    if (type && type !== "All") {
      filter.leaveType = type;
    }

    if (from && to) {
      filter.startDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "Leaves fetched successfully",
      leave: leaves,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// PUT: Update leave status (for employee)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedLeave = await Leave.findByIdAndUpdate(id, { status, $currentDate: { updatedAt: true } }, { new: true });
     if (!updatedLeave) {
      return res.status(404).json({ status: false, message: "Leave not found" });
    }
    res.status(200).json({status:true, message: `Leave ${status} successfully`, leave: updatedLeave});
  } catch (error) {
    res.status(500).json({status:false, message: error.message });
  }
};

// 🔹 Get All Leaves 
exports.getAllLeavesAdmin = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "fullName personalEmail employeeId documents.profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "All leaves fetched successfully",
      leave: leaves,
      total: leaves.length,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// 🔹 Get Filtered Leaves (with pagination + filters)
exports.getFilteredLeavesAdmin = async (req, res) => {
  try {
    let { status, type, page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }
    if (type && type !== "All") {
      filter.leaveType = type;
    }

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
    ];

    if (search && search.trim() !== "") {
      pipeline.push({
        $match: {
          $or: [
            { "employee.fullName": { $regex: search, $options: "i" } },
            { "employee.employeeId": { $regex: search, $options: "i" } },
            { "employee.personalEmail": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // 👇 Sirf limited fields select karna
    pipeline.push({
      $project: {
        _id: 1,
        leaveType: 1,
        status: 1,
        startDate: 1,
        endDate: 1,
        duration:1,
        reason: 1,
        createdAt: 1,
        updatedAt:1,
        "employee._id": 1,
        "employee.fullName": 1,
        "employee.personalEmail": 1,
        "employee.employeeId": 1,
        "employee.documents.profileImage": 1,
      },
    });

    const leaves = await Leave.aggregate(pipeline);

    const countPipeline = pipeline.filter(
      (stage) => !("$skip" in stage || "$limit" in stage || "$sort" in stage || "$project" in stage)
    );
    const totalLeaves = await Leave.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);

    res.status(200).json({
      status: true,
      message: "Filtered leaves fetched successfully",
      leave: leaves,
      pagination: {
        total: totalLeaves[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((totalLeaves[0]?.total || 0) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// POST: Add comment to a leave
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;  // leave id
    const { text, userId } = req.body; // comment text + user id body se lo

   const updatedLeave = await Leave.findByIdAndUpdate(
  id,
  {
    $push: {
      comments: {
        user: new mongoose.Types.ObjectId(userId), // ObjectId me cast karo
        text: text,
        createdAt: new Date()
      }
    }
  },
  { new: true }
).populate("comments.user", "fullName employeeId");

    if (!updatedLeave) {
      return res.status(404).json({ status: false, message: "Leave not found" });
    }

    res.status(200).json({ status: true, message: "Comment added successfully", leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



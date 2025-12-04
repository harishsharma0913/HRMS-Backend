const Task = require("../Models/taskAddSchema");
const userModel = require("../Models/userSingUpSchema");
// ---------------------- CREATE TASK ----------------------
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignTo, dueDate, priority, status, createdBy } = req.body;

    // Check if assigned user exists
    const userExists = await userModel.findById(assignTo);
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "Assigned employee not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignTo,
      dueDate,
      priority,
      status,
      createdBy,
    });

    res.status(201).json({
      status: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ---------------------- GET ALL TASKS ----------------------
exports.getAllTasks = async (req, res) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    let filter = {};

    // 🔍 SEARCH FILTER (employee + title + priority)
    if (req.query.search) {
      const search = req.query.search.trim();

      // employee search
      const employees = await userModel.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ];

      if (employees.length > 0) {
        filter.$or.push({ assignTo: { $in: employees.map((e) => e._id) } });
      }
    }

    // 🟦 STATUS FILTER (button click)
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status; // Pending | InProgress | Completed
    }

    // 📅 DATE FILTERS (from – to)
    // --------------------------------------
    if (req.query.startDate && req.query.endDate) {
      filter.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // 🧲 FETCH RESULTS WITH PAGINATION
    const tasks = await Task.find(filter)
      .populate("assignTo", "fullName employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    // 🛠 FORMAT RESPONSE FOR UI
    const formatted = tasks.map((task) => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      assignTo: task.assignTo
        ? {
            fullName: task.assignTo.fullName,
            employeeId: task.assignTo.employeeId,
          }
        : null,
    }));

    res.status(200).json({
      status: true,
      message: "Tasks fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tasks: formatted,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: err.message || "Unable to fetch tasks",
    });
  }
};


// ---------------------- UPDATE TASK ----------------------
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {status} = req.body;

    const updatedTask = await Task.findByIdAndUpdate(id,  { status } , {
      new: true,
      runValidators: true,
    }).populate("assignTo", "fullName personalEmail");

    if (!updatedTask) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message || "Failed to update task",
    });
  }
};

// ---------------------- DELETE TASK ----------------------
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message || "Failed to delete task",
    });
  }
};

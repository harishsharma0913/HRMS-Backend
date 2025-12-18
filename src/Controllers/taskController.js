const Task = require("../Models/taskAddSchema");
const userModel = require("../Models/userSingUpSchema");
// ---------------------- admin CREATE TASK ----------------------
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignTo, dueDate, priority, createdBy } = req.body;

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

// ---------------------- admin GET ALL TASKS ----------------------
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
      .populate("assignTo", "_id fullName employeeId")
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
            employee_Id: task.assignTo._id,
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

// ---------------------- user UPDATE TASK ----------------------
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

// ---------------------- ADMIN UPDATE TASK ----------------------
exports.adminUpdateTask = async (req, res) => {
  console.log(req.body);
  
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignTo,
      dueDate,
      priority,
      createdBy
    } = req.body;    

    // 🔎 Task exist check
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }

    // 👤 assignTo validation (agar change ho raha ho)
    if (assignTo) {
      const userExists = await userModel.findById(assignTo);
      if (!userExists) {
        return res.status(404).json({
          status: false,
          message: "Assigned employee not found",
        });
      }
      task.assignTo = assignTo;
    }

    // 🛠 Update only provided fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (createdBy !== undefined) task.createdBy = createdBy

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("assignTo", "fullName employeeId personalEmail");

    res.status(200).json({
      status: true,
      message: "Task updated successfully (Admin)",
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

// ---------------------- admin DELETE TASK ----------------------
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

// ---------------------- EMPLOYEE: GET ONLY MY TASKS (+ pagination + filters) ----------------------
exports.getMyTasks = async (req, res) => {
  try {
    let { page , limit , search, status } = req.query;

    const employeeId = req.user.id; // ⬅ middleware से आएगा (auth)
    
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    let filter = { assignTo: employeeId };  // ⬅ Important: सिर्फ employee के tasks

    // 🔍 SEARCH (title + priority)
    if (search) {
      const s = search.trim();

      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { priority: { $regex: s, $options: "i" } },
      ];
    }

    // 🟦 STATUS FILTER
    if (status && status !== "All") {
      filter.status = status; // Pending | InProgress | Completed
    }

    // ▶ Fetch data
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      status: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tasks,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: err.message || "Unable to fetch tasks",
    });
  }
};

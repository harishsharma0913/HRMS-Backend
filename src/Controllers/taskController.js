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
    const tasks = await Task.find()
      .populate("assignTo", "fullName personalEmail") // Only basic user info
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message || "Unable to fetch tasks",
    });
  }
};

// ---------------------- GET SINGLE TASK ----------------------
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate(
      "assignTo",
      "fullName personalEmail phoneNo"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ---------------------- UPDATE TASK ----------------------
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignTo", "fullName personalEmail");

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
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
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

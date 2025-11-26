const SupportTicket = require('../Models/SupportTicket');
const generateTicketId = require('../Utils/generateTicketId');

  const createSupportTicket = async (req, res) => {
      const ticketId = generateTicketId();
      const employeeId = req.params.id; 
      const { subject, category, priority, description } = req.body;
      const attachment = req.file?.filename || null;

    try {
      const ticket = await SupportTicket.create({
        ticketId : ticketId,
        employeeId: employeeId,
        subject : subject,
        category : category || 'Technical Issue',
        priority : priority || 'Low',
        description : description,
        attachments: attachment
      });

      return res.status(201).json({
        status: true,
        message: 'Support ticket created successfully',
        data: ticket
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'Server error: ' + error.message,
        error: error.message
      });
    }
  };
   
  const getTickets = async (req, res) => {
    const id = req.params.id;

    try {
      const tickets = await SupportTicket.find({ employeeId: id })
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name email'); 
     
    res.status(200).json({
      status: true,
      message: 'Tickets fetched successfully',
      tickets: tickets,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch tickets: ' + error.message,
      error: error.message
    });
  }
};

// 1️⃣ Get All Tickets (for Admin)
 const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("employeeId", "fullName officialEmail employeeId");

    res.status(200).json({
      status: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error" || error.message });
  }
};

// 2️⃣ Get Filtered Tickets (for Admin) with Search, Filters, Pagination
const getFilteredTickets = async (req, res) => {
  try {
    const { search, category, priority, status, page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    let matchStage = {};

    if (category) matchStage.category = category;
    if (priority) matchStage.priority = priority;
    if (status) matchStage.status = status;

    let pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },

      {
        $lookup: {
          from: "designations",              
          localField: "employee.designation", 
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      {
        $match: matchStage,
      },
      {
        $project: {
          ticketId: 1,
          subject: 1,
          category: 1,
          priority: 1,
          description: 1,
          attachments: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "employee.fullName": 1,
          "employee.officialEmail": 1,
          "employee.employeeId": 1,
          "designation.name": 1,
          "employee.documents.profileImage": 1,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { ticketId: { $regex: search, $options: "i" } },
            { "employee.fullName": { $regex: search, $options: "i" } },
            { "employee.officialEmail": { $regex: search, $options: "i" } },
            { "employee.employeeId": { $regex: search, $options: "i" } },
            { "designation.name": { $regex: search, $options: "i" } }, // ✅ ab designation name pe bhi search hoga
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    const tickets = await SupportTicket.aggregate(pipeline);

    const countPipeline = pipeline.filter(
      (stage) => !("$skip" in stage) && !("$limit" in stage)
    );
    const totalCountResult = await SupportTicket.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);
    const total = totalCountResult[0]?.total || 0;

    res.status(200).json({
      status: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Server Error",
      error: error.message,
    });
  }
};

// 3️⃣ Update Ticket Status
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params; // ticket id
    const { status } = req.body; // new status

    // ✅ Allowed status values
    const allowedStatus = ["Pending", "Open", "In Progress", "Resolved", "Closed"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update ticket
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("employeeId", "fullName officialEmail employeeId");

    if (!updatedTicket) {
      return res.status(404).json({
        status: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Ticket status updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server Error" || error.message,
      error: error.message,
    });
  }
};

// 4️⃣ Get Single Ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id).populate(
      "employeeId",
      "fullName officialEmail employeeId designation"
    );

    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server Error" || error.message,
      error: error.message,
    });
  }
};

module.exports = {
  createSupportTicket,
  getTickets,
  getAllTickets,
  getFilteredTickets,
  updateTicketStatus,
  getTicketById
};

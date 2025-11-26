const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  employeeId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technical Issue', 'Account Access', 'System Error'],
    default: 'Technical Issue'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  description: {
    type: String,
    required: true
  },
  attachments: {
      type: String ,
      default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  }
},{
  timestamps: true
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
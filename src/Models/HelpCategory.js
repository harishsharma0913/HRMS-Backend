const mongoose = require('mongoose');

const HelpCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('HelpCategory', HelpCategorySchema);

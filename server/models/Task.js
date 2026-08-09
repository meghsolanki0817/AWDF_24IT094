const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to trim whitespace from title
taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);

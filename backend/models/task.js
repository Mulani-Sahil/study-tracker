const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate duration before saving
TaskSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const diff = this.endTime - this.startTime;
    this.duration = Math.round(diff / (1000 * 60)); // Convert to minutes
  }
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
TaskSchema.index({ userId: 1, date: -1 });
TaskSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);

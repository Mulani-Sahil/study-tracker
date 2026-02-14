const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { date, status, limit = 100 } = req.query;
    
    let query = { userId: req.user._id };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const tasks = await Task.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 100 })
      .withMessage('Subject cannot exceed 100 characters'),
    body('startTime')
      .notEmpty()
      .withMessage('Start time is required')
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .notEmpty()
      .withMessage('End time is required')
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { subject, startTime, endTime, notes } = req.body;

      // Validate time range
      if (new Date(endTime) <= new Date(startTime)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }

      // Create task
      const task = new Task({
        userId: req.user._id,
        subject,
        startTime,
        endTime,
        notes,
        date: new Date(startTime)
      });

      await task.save();

      // Update user's study streak
      const user = await User.findById(req.user._id);
      user.updateStreak();
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task
      });

    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating task'
      });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { subject, startTime, endTime, status, notes } = req.body;

    // Find task
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate time range if updating times
    if (startTime && endTime) {
      if (new Date(endTime) <= new Date(startTime)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    // Update fields
    if (subject) task.subject = subject;
    if (startTime) task.startTime = startTime;
    if (endTime) task.endTime = endTime;
    if (status) task.status = status;
    if (notes !== undefined) task.notes = notes;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'completed' },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task marked as completed',
      task
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
});

module.exports = router;

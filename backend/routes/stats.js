// const express = require('express');
// const router = express.Router();
// const Task = require('../models/task');
// const User = require('../models/User');
// const auth = require('../middleware/auth');

// // All routes are protected
// router.use(auth);

// // @route   GET /api/stats/today
// // @desc    Get today's total study hours
// // @access  Private
// router.get('/today', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const tasks = await Task.find({
//       userId: req.user._id,
//       date: { $gte: today, $lt: tomorrow }
//     });

//     // Calculate total minutes
//     const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;

//     res.json({
//       success: true,
//       data: {
//         totalMinutes,
//         hours,
//         minutes,
//         formattedTime: `${hours}h ${minutes}m`,
//         taskCount: tasks.length,
//         completedCount: tasks.filter(t => t.status === 'completed').length
//       }
//     });

//   } catch (error) {
//     console.error('Get today stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching today\'s statistics'
//     });
//   }
// });

// // @route   GET /api/stats/week
// // @desc    Get weekly study data (last 7 days)
// // @access  Private
// router.get('/week', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(23, 59, 59, 999);
//     const weekAgo = new Date(today);
//     weekAgo.setDate(weekAgo.getDate() - 6);
//     weekAgo.setHours(0, 0, 0, 0);

//     const tasks = await Task.find({
//       userId: req.user._id,
//       date: { $gte: weekAgo, $lte: today }
//     });

//     // Group tasks by day
//     const weekData = [];
//     const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//     for (let i = 0; i < 7; i++) {
//       const date = new Date(weekAgo);
//       date.setDate(date.getDate() + i);
//       const dateStr = date.toISOString().split('T')[0];
      
//       const dayTasks = tasks.filter(task => {
//         const taskDate = new Date(task.date);
//         return taskDate.toISOString().split('T')[0] === dateStr;
//       });

//       const totalMinutes = dayTasks.reduce((sum, task) => sum + task.duration, 0);
//       const hours = (totalMinutes / 60).toFixed(1);

//       weekData.push({
//         date: dateStr,
//         day: dayNames[date.getDay()],
//         hours: parseFloat(hours),
//         minutes: totalMinutes,
//         taskCount: dayTasks.length
//       });
//     }

//     // Calculate week totals
//     const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
//     const totalHours = Math.floor(totalMinutes / 60);
//     const remainingMinutes = totalMinutes % 60;

//     res.json({
//       success: true,
//       data: {
//         weekData,
//         totalMinutes,
//         totalHours,
//         formattedTotal: `${totalHours}h ${remainingMinutes}m`,
//         averagePerDay: (totalMinutes / 7 / 60).toFixed(1)
//       }
//     });

//   } catch (error) {
//     console.error('Get week stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching weekly statistics'
//     });
//   }
// });

// // @route   GET /api/stats/streak
// // @desc    Get current study streak
// // @access  Private
// router.get('/streak', async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     // Check if streak is still valid (studied today or yesterday)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     let currentStreak = user.studyStreak;
    
//     if (user.lastStudyDate) {
//       const lastStudy = new Date(user.lastStudyDate);
//       lastStudy.setHours(0, 0, 0, 0);
      
//       const diffTime = today - lastStudy;
//       const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
//       // If more than 1 day has passed, streak is broken
//       if (diffDays > 1) {
//         currentStreak = 0;
//         user.studyStreak = 0;
//         await user.save();
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         streak: currentStreak,
//         lastStudyDate: user.lastStudyDate,
//         isActiveToday: user.lastStudyDate 
//           ? new Date(user.lastStudyDate).toDateString() === today.toDateString()
//           : false
//       }
//     });

//   } catch (error) {
//     console.error('Get streak error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching streak data'
//     });
//   }
// });

// // @route   GET /api/stats/subjects
// // @desc    Get study time breakdown by subject
// // @access  Private
// router.get('/subjects', async (req, res) => {
//   try {
//     const { days = 30 } = req.query;
    
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - parseInt(days));
//     startDate.setHours(0, 0, 0, 0);

//     const tasks = await Task.find({
//       userId: req.user._id,
//       date: { $gte: startDate }
//     });

//     // Group by subject
//     const subjectStats = {};
    
//     tasks.forEach(task => {
//       if (!subjectStats[task.subject]) {
//         subjectStats[task.subject] = {
//           subject: task.subject,
//           totalMinutes: 0,
//           taskCount: 0,
//           completedCount: 0
//         };
//       }
      
//       subjectStats[task.subject].totalMinutes += task.duration;
//       subjectStats[task.subject].taskCount += 1;
//       if (task.status === 'completed') {
//         subjectStats[task.subject].completedCount += 1;
//       }
//     });

//     // Convert to array and add formatted data
//     const subjectsArray = Object.values(subjectStats).map(stat => ({
//       ...stat,
//       hours: (stat.totalMinutes / 60).toFixed(1),
//       percentage: ((stat.totalMinutes / tasks.reduce((sum, t) => sum + t.duration, 0)) * 100).toFixed(1)
//     }));

//     // Sort by total time
//     subjectsArray.sort((a, b) => b.totalMinutes - a.totalMinutes);

//     res.json({
//       success: true,
//       data: {
//         subjects: subjectsArray,
//         totalSubjects: subjectsArray.length
//       }
//     });

//   } catch (error) {
//     console.error('Get subjects stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching subject statistics'
//     });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/stats/today
// @desc    Get today's total study hours
// @access  Private
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // Calculate total minutes
    const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    res.json({
      success: true,
      data: {
        totalMinutes,
        hours,
        minutes,
        formattedTime: `${hours}h ${minutes}m`,
        taskCount: tasks.length,
        completedCount: tasks.filter(t => t.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Get today stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today\'s statistics'
    });
  }
});

// @route   GET /api/stats/week
// @desc    Get weekly study data (last 7 days)
// @access  Private
router.get('/week', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: weekAgo, $lte: today }
    });

    // Group tasks by day
    const weekData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toISOString().split('T')[0] === dateStr;
      });

      const totalMinutes = dayTasks.reduce((sum, task) => sum + task.duration, 0);
      const hours = (totalMinutes / 60).toFixed(1);

      weekData.push({
        date: dateStr,
        day: dayNames[date.getDay()],
        hours: parseFloat(hours),
        minutes: totalMinutes,
        taskCount: dayTasks.length
      });
    }

    // Calculate week totals
    const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    res.json({
      success: true,
      data: {
        weekData,
        totalMinutes,
        totalHours,
        formattedTotal: `${totalHours}h ${remainingMinutes}m`,
        averagePerDay: (totalMinutes / 7 / 60).toFixed(1)
      }
    });

  } catch (error) {
    console.error('Get week stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching weekly statistics'
    });
  }
});

// @route   GET /api/stats/streak
// @desc    Get current study streak
// @access  Private
router.get('/streak', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if streak is still valid (studied today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = user.studyStreak;
    
    if (user.lastStudyDate) {
      const lastStudy = new Date(user.lastStudyDate);
      lastStudy.setHours(0, 0, 0, 0);
      
      const diffTime = today - lastStudy;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      // If more than 1 day has passed, streak is broken
      if (diffDays > 1) {
        currentStreak = 0;
        user.studyStreak = 0;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        streak: currentStreak,
        lastStudyDate: user.lastStudyDate,
        isActiveToday: user.lastStudyDate 
          ? new Date(user.lastStudyDate).toDateString() === today.toDateString()
          : false
      }
    });

  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching streak data'
    });
  }
});

// @route   GET /api/stats/subjects
// @desc    Get study time breakdown by subject
// @access  Private
router.get('/subjects', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: startDate }
    });

    // Group by subject
    const subjectStats = {};
    
    tasks.forEach(task => {
      if (!subjectStats[task.subject]) {
        subjectStats[task.subject] = {
          subject: task.subject,
          totalMinutes: 0,
          taskCount: 0,
          completedCount: 0
        };
      }
      
      subjectStats[task.subject].totalMinutes += task.duration;
      subjectStats[task.subject].taskCount += 1;
      if (task.status === 'completed') {
        subjectStats[task.subject].completedCount += 1;
      }
    });

    // Convert to array and add formatted data
    const subjectsArray = Object.values(subjectStats).map(stat => ({
      ...stat,
      hours: (stat.totalMinutes / 60).toFixed(1),
      percentage: ((stat.totalMinutes / tasks.reduce((sum, t) => sum + t.duration, 0)) * 100).toFixed(1)
    }));

    // Sort by total time
    subjectsArray.sort((a, b) => b.totalMinutes - a.totalMinutes);

    res.json({
      success: true,
      data: {
        subjects: subjectsArray,
        totalSubjects: subjectsArray.length
      }
    });

  } catch (error) {
    console.error('Get subjects stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subject statistics'
    });
  }
});

module.exports = router;

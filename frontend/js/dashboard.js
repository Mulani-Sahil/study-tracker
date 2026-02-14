// API Configuration
const API_URL = 'https://study-tracker-it26.onrender.com/api';

// Chart instances
let weeklyChart = null;
let subjectChart = null;

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Get auth headers
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Load user data
function loadUserData() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.username) {
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;
    
    // Set avatar initial
    const initial = user.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initial;
  }
}

// Set current date
function setCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  document.getElementById('currentDate').textContent = today;
}

// Show section
function showSection(sectionName) {
  // Hide all sections
  const sections = ['dashboard', 'tasks', 'timer', 'analytics'];
  sections.forEach(section => {
    document.getElementById(`${section}Section`).classList.add('hidden');
  });
  
  // Show selected section
  document.getElementById(`${sectionName}Section`).classList.remove('hidden');
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  event.target.closest('.nav-link').classList.add('active');
  
  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    tasks: 'My Tasks',
    timer: 'Study Timer',
    analytics: 'Analytics'
  };
  document.getElementById('pageTitle').textContent = titles[sectionName];
  
  // Load section-specific data
  if (sectionName === 'analytics') {
    loadAnalytics();
  }
}

// Load dashboard data
async function loadDashboardData() {
  await Promise.all([
    loadTodayStats(),
    loadWeekStats(),
    loadStreakStats()
  ]);
}

// Load today's stats
async function loadTodayStats() {
  try {
    const response = await fetch(`${API_URL}/stats/today`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { hours, minutes, completedCount, taskCount } = data.data;
      document.getElementById('todayHours').textContent = `${hours}h ${minutes}m`;
      
      if (completedCount > 0) {
        document.getElementById('todayChange').innerHTML = `
          <i class="fas fa-check-circle"></i> ${completedCount} of ${taskCount} tasks completed
        `;
      }
    }
  } catch (error) {
    console.error('Load today stats error:', error);
  }
}

// Load week stats
async function loadWeekStats() {
  try {
    const response = await fetch(`${API_URL}/stats/week`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { totalHours, weekData, averagePerDay } = data.data;
      document.getElementById('weekHours').textContent = `${totalHours}h`;
      document.getElementById('weekChange').innerHTML = `
        <i class="fas fa-chart-line"></i> ${averagePerDay}h average per day
      `;
      
      // Update weekly chart
      updateWeeklyChart(weekData);
    }
  } catch (error) {
    console.error('Load week stats error:', error);
  }
}

// Load streak stats
async function loadStreakStats() {
  try {
    const response = await fetch(`${API_URL}/stats/streak`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { streak, isActiveToday } = data.data;
      document.getElementById('streakDays').textContent = `${streak} Days`;
      
      if (isActiveToday) {
        document.getElementById('streakStatus').textContent = 'Active today! 🔥';
      } else if (streak > 0) {
        document.getElementById('streakStatus').textContent = 'Study today to keep it!';
      } else {
        document.getElementById('streakStatus').textContent = 'Start your streak!';
      }
    }
  } catch (error) {
    console.error('Load streak stats error:', error);
  }
}

// Update weekly chart
function updateWeeklyChart(weekData) {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (weeklyChart) {
    weeklyChart.destroy();
  }
  
  // Get theme colors
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f5f1e8' : '#1a1410';
  const gridColor = isDark ? '#3a3632' : '#e7dfd2';
  
  weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weekData.map(d => d.day),
      datasets: [{
        label: 'Study Hours',
        data: weekData.map(d => d.hours),
        backgroundColor: 'rgba(217, 119, 6, 0.8)',
        borderColor: 'rgba(217, 119, 6, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1a1816' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} hours`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              return value + 'h';
            }
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Set chart height
  ctx.style.height = '300px';
}

// Load analytics
async function loadAnalytics() {
  try {
    const response = await fetch(`${API_URL}/stats/subjects?days=30`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateSubjectChart(data.data.subjects);
      updateAnalyticsStats(data.data.subjects);
    }
  } catch (error) {
    console.error('Load analytics error:', error);
  }
}

// Update subject chart
function updateSubjectChart(subjects) {
  const ctx = document.getElementById('subjectChart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (subjectChart) {
    subjectChart.destroy();
  }
  
  if (subjects.length === 0) {
    ctx.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No data available. Start adding tasks to see analytics!</p>';
    return;
  }
  
  // Get theme colors
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f5f1e8' : '#1a1410';
  
  // Generate colors for subjects
  const colors = [
    'rgba(217, 119, 6, 0.8)',
    'rgba(234, 88, 12, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(252, 211, 77, 0.8)',
    'rgba(5, 150, 105, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(52, 211, 153, 0.8)'
  ];
  
  subjectChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: subjects.map(s => s.subject),
      datasets: [{
        data: subjects.map(s => s.hours),
        backgroundColor: colors.slice(0, subjects.length),
        borderWidth: 2,
        borderColor: isDark ? '#1a1816' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            padding: 15,
            font: {
              size: 13
            }
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#1a1816' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#3a3632' : '#e7dfd2',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed}h (${context.dataset.data[context.dataIndex]}%)`;
            }
          }
        }
      }
    }
  });
  
  ctx.style.height = '300px';
}

// Update analytics stats
function updateAnalyticsStats(subjects) {
  const totalTasks = subjects.reduce((sum, s) => sum + s.taskCount, 0);
  const completedTasks = subjects.reduce((sum, s) => sum + s.completedCount, 0);
  const totalHours = subjects.reduce((sum, s) => sum + parseFloat(s.hours), 0);
  
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('avgDaily').textContent = (totalHours / 30).toFixed(1) + 'h';
}

// Initialize dashboard
async function initDashboard() {
  if (!checkAuth()) return;
  
  loadUserData();
  setCurrentDate();
  await loadDashboardData();
  await loadTasks();
  
  // Listen for theme changes to update charts
  const observer = new MutationObserver(() => {
    if (weeklyChart) {
      loadWeekStats();
    }
    if (subjectChart && !document.getElementById('analyticsSection').classList.contains('hidden')) {
      loadAnalytics();
    }
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

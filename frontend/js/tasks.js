// Get auth token
function getAuthToken() {
  return localStorage.getItem('token');
}

// API Headers with authentication
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  };
}

// Modal Management
function openAddTaskModal() {
  document.getElementById('taskModal').classList.remove('hidden');
  
  // Set default start time to now
  const now = new Date();
  const dateTimeString = now.toISOString().slice(0, 16);
  document.getElementById('taskStartTime').value = dateTimeString;
  
  // Set default end time to 1 hour from now
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  document.getElementById('taskEndTime').value = oneHourLater.toISOString().slice(0, 16);
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.add('hidden');
  document.getElementById('taskForm').reset();
}

// Add Task
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const subject = document.getElementById('taskSubject').value;
  const startTime = document.getElementById('taskStartTime').value;
  const endTime = document.getElementById('taskEndTime').value;
  const notes = document.getElementById('taskNotes').value;
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        subject,
        startTime,
        endTime,
        notes
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeTaskModal();
      loadTasks();
      loadDashboardData(); // Refresh dashboard stats
      alert('Task added successfully!');
    } else {
      alert(data.message || 'Failed to add task');
    }
  } catch (error) {
    console.error('Add task error:', error);
    alert('Failed to add task. Please try again.');
  }
});

// Load all tasks
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks?limit=100`, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayAllTasks(data.tasks);
      displayTodayTasks(data.tasks);
    }
  } catch (error) {
    console.error('Load tasks error:', error);
  }
}

// Display all tasks
function displayAllTasks(tasks) {
  const taskList = document.getElementById('allTaskList');
  
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = `
      <li style="padding: 2rem; text-align: center; color: var(--text-tertiary);">
        No tasks yet. Create your first task!
      </li>
    `;
    return;
  }
  
  taskList.innerHTML = tasks.map(task => createTaskHTML(task)).join('');
}

// Display today's tasks
function displayTodayTasks(tasks) {
  const taskList = document.getElementById('todayTaskList');
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0];
    return taskDate === today;
  });
  
  if (todayTasks.length === 0) {
    taskList.innerHTML = `
      <li style="padding: 2rem; text-align: center; color: var(--text-tertiary);">
        No tasks for today. Add your first task!
      </li>
    `;
    return;
  }
  
  taskList.innerHTML = todayTasks.map(task => createTaskHTML(task)).join('');
}

// Create task HTML
function createTaskHTML(task) {
  const startTime = new Date(task.startTime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const endTime = new Date(task.endTime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const completedClass = task.status === 'completed' ? 'completed' : '';
  
  return `
    <li class="task-item ${completedClass}">
      <div class="task-checkbox" onclick="toggleTaskComplete('${task._id}', '${task.status}')"></div>
      <div class="task-content">
        <div class="task-subject">${task.subject}</div>
        <div class="task-time">${startTime} - ${endTime}</div>
      </div>
      <div class="task-duration">${task.duration} min</div>
      <div class="task-actions">
        <button class="btn btn-secondary btn-sm btn-icon" onclick="deleteTask('${task._id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </li>
  `;
}

// Toggle task completion
async function toggleTaskComplete(taskId, currentStatus) {
  if (currentStatus === 'completed') return; // Don't allow un-completing
  
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      loadTasks();
      loadDashboardData();
    }
  } catch (error) {
    console.error('Toggle complete error:', error);
  }
}

// Delete task
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      loadTasks();
      loadDashboardData();
    }
  } catch (error) {
    console.error('Delete task error:', error);
    alert('Failed to delete task');
  }
}

// Filter tasks
async function filterTasks() {
  const status = document.getElementById('filterStatus').value;
  const date = document.getElementById('filterDate').value;
  
  let url = `${API_URL}/tasks?limit=100`;
  
  if (status !== 'all') {
    url += `&status=${status}`;
  }
  
  if (date) {
    url += `&date=${date}`;
  }
  
  try {
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayAllTasks(data.tasks);
    }
  } catch (error) {
    console.error('Filter tasks error:', error);
  }
}

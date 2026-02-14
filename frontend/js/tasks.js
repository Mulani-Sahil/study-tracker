

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
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Set default start time to 1 hour ago
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    document.getElementById('taskStartTime').value = oneHourAgo.toISOString().slice(0, 16);
    
    // Set default end time to now
    document.getElementById('taskEndTime').value = now.toISOString().slice(0, 16);
  }
}

function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.add('hidden');
    const form = document.getElementById('taskForm');
    if (form) form.reset();
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('taskModal');
  if (event.target === modal) {
    closeTaskModal();
  }
}

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeTaskModal();
  }
});

// Add Task
const taskForm = document.getElementById('taskForm');
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const subject = document.getElementById('taskSubject').value;
    const startTime = document.getElementById('taskStartTime').value;
    const endTime = document.getElementById('taskEndTime').value;
    const notes = document.getElementById('taskNotes').value;
    
    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      alert('End time must be after start time!');
      return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;
    
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
        if (typeof loadTasks === 'function') loadTasks();
        if (typeof loadDashboardData === 'function') loadDashboardData();
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = '<i class="fas fa-check-circle"></i> Task added successfully!';
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      } else {
        alert(data.message || 'Failed to add task. Please try again.');
      }
    } catch (error) {
      console.error('Add task error:', error);
      alert('Failed to add task. Please check your connection and try again.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

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
  if (!taskList) return;
  
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
  if (!taskList) return;
  
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
  if (currentStatus === 'completed') return;
  
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      loadTasks();
      if (typeof loadDashboardData === 'function') loadDashboardData();
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
      if (typeof loadDashboardData === 'function') loadDashboardData();
      
      // Show success message
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-success';
      alertDiv.style.position = 'fixed';
      alertDiv.style.top = '20px';
      alertDiv.style.right = '20px';
      alertDiv.style.zIndex = '9999';
      alertDiv.innerHTML = '<i class="fas fa-check-circle"></i> Task deleted successfully!';
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 3000);
    }
  } catch (error) {
    console.error('Delete task error:', error);
    alert('Failed to delete task');
  }
}

// Filter tasks
async function filterTasks() {
  const statusSelect = document.getElementById('filterStatus');
  const dateInput = document.getElementById('filterDate');
  
  if (!statusSelect || !dateInput) return;
  
  const status = statusSelect.value;
  const date = dateInput.value;
  
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
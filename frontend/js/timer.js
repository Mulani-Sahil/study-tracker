// Timer State
let timerInterval = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let timerMode = 'pomodoro'; // 'pomodoro' or 'break'
let isRunning = false;

// Timer Modes
const TIMER_MODES = {
  pomodoro: 25 * 60, // 25 minutes
  break: 5 * 60      // 5 minutes
};

// Initialize timer
function initTimer() {
  updateTimerDisplay();
}

// Set timer mode
function setTimerMode(mode) {
  if (isRunning) {
    pauseTimer();
  }
  
  timerMode = mode;
  timeRemaining = TIMER_MODES[mode];
  updateTimerDisplay();
  
  // Update button styles
  const pomodoroBtn = document.getElementById('pomodoroBtn');
  const breakBtn = document.getElementById('breakBtn');
  
  if (mode === 'pomodoro') {
    pomodoroBtn.classList.remove('btn-secondary');
    pomodoroBtn.classList.add('btn-primary');
    breakBtn.classList.remove('btn-primary');
    breakBtn.classList.add('btn-secondary');
  } else {
    breakBtn.classList.remove('btn-secondary');
    breakBtn.classList.add('btn-primary');
    pomodoroBtn.classList.remove('btn-primary');
    pomodoroBtn.classList.add('btn-secondary');
  }
}

// Start timer
function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('pauseBtn').classList.remove('hidden');
  
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      // Timer finished
      completeTimer();
    }
  }, 1000);
}

// Pause timer
function pauseTimer() {
  if (!isRunning) return;
  
  isRunning = false;
  clearInterval(timerInterval);
  
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.add('hidden');
}

// Reset timer
function resetTimer() {
  pauseTimer();
  timeRemaining = TIMER_MODES[timerMode];
  updateTimerDisplay();
}

// Complete timer
function completeTimer() {
  pauseTimer();
  
  // Play notification sound (if supported)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzOH0fPTgjMGHm7A7+OZURE=');
    audio.play().catch(() => {});
  } catch (e) {}
  
  // Show notification
  if (timerMode === 'pomodoro') {
    alert('🎉 Pomodoro session complete! Time for a break.');
    setTimerMode('break');
  } else {
    alert('✨ Break time over! Ready for another session?');
    setTimerMode('pomodoro');
  }
  
  // Optionally auto-start next session
  // startTimer();
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timerDisplay').textContent = display;
  
  // Update page title with timer
  if (isRunning) {
    document.title = `${display} - Study Timer`;
  } else {
    document.title = 'Dashboard - Study Tracker';
  }
}

// Initialize timer when page loads
if (document.getElementById('timerDisplay')) {
  initTimer();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

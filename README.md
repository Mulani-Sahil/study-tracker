# Study Activity & Daily Schedule Tracker

A full-stack web application for tracking study activities, managing daily schedules, and visualizing study progress with authentication and real-time analytics.

## 🚀 Features

- **User Authentication**: Secure JWT-based login/signup
- **Dashboard Analytics**: 
  - Total study hours today
  - Weekly study progress chart
  - Study streak counter
- **Task Management**: Add, edit, complete daily tasks with subjects and time tracking
- **Study Timer**: Built-in Pomodoro timer (25/5 minute cycles)
- **Weekly Charts**: Visual representation of study hours
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Mobile-friendly UI
- **Real-time Updates**: Instant data synchronization

## 📁 Project Structure

```
study-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Task.js               # Task schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── tasks.js              # Task CRUD routes
│   │   └── stats.js              # Statistics routes
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server setup
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── styles.css            # Main stylesheet
│   ├── js/
│   │   ├── auth.js               # Authentication logic
│   │   ├── dashboard.js          # Dashboard functionality
│   │   ├── tasks.js              # Task management
│   │   ├── timer.js              # Pomodoro timer
│   │   └── theme.js              # Dark/Light mode toggle
│   ├── index.html                # Login/Signup page
│   ├── dashboard.html            # Main dashboard
│   └── package.json
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing, CORS enabled

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study-tracker
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Open with live server or any HTTP server:
```bash
# Using Python
python -m http.server 3000

# Or using Node.js http-server
npx http-server -p 3000
```

Frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  lastLogin: Date,
  studyStreak: Number,
  lastStudyDate: Date
}
```

### Task Model
```javascript
{
  userId: ObjectId (ref: User),
  subject: String (required),
  startTime: Date (required),
  endTime: Date (required),
  status: String (enum: ['pending', 'completed']),
  duration: Number (in minutes),
  date: Date,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all user tasks (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `PATCH /api/tasks/:id/complete` - Mark task as completed (protected)

### Statistics
- `GET /api/stats/today` - Get today's study hours (protected)
- `GET /api/stats/week` - Get weekly study data (protected)
- `GET /api/stats/streak` - Get current study streak (protected)

## 🎨 Features Breakdown

### 1. Authentication System
- Secure password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- Token stored in localStorage

### 2. Dashboard
- Real-time study hours display
- Weekly progress bar chart
- Streak counter with daily tracking
- Quick stats overview

### 3. Task Management
- Add tasks with subject, start/end time
- Edit existing tasks
- Mark tasks as complete
- Delete tasks
- Filter by date and status

### 4. Pomodoro Timer
- 25-minute focus sessions
- 5-minute break intervals
- Audio notifications
- Pause/Resume functionality
- Auto-start next session

### 5. Dark/Light Mode
- System preference detection
- Manual toggle switch
- Persistent theme storage
- Smooth transitions

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
```bash
# Install production dependencies
npm install --production

# Set environment variables on platform
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_secret
NODE_ENV=production
```

### Frontend (Netlify/Vercel)
1. Build frontend assets
2. Update API endpoint in frontend JS files to production URL
3. Deploy to static hosting platform

## 🔐 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (24 hours)
- Protected API routes
- CORS configuration
- Input validation
- XSS protection headers

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Touch-friendly interface
- Optimized charts for small screens

## 🎯 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Study goals and targets
- [ ] Export data to CSV/PDF
- [ ] Study categories and tags
- [ ] Notifications and reminders
- [ ] Social features (study groups)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Studying! 📚✨**

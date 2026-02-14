# Quick Start Guide - Study Tracker

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Choose one option:
  - Local installation: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas (Free)](https://www.mongodb.com/cloud/atlas/register)
- **Git** (optional) - [Download here](https://git-scm.com/)

## Step-by-Step Installation

### 1. Download the Project

If you have the project folder, navigate to it in your terminal. Otherwise:

```bash
cd study-tracker
```

### 2. Backend Setup

#### A. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- dotenv (environment variables)
- express-validator (input validation)

#### B. Configure Environment Variables

The `.env` file is already created. Update these values if needed:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/study-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_random_string
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study-tracker?retryWrites=true&w=majority
```

#### C. Start MongoDB (Local Only)

If using local MongoDB:

**Windows:**
```bash
# Run in a separate terminal
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

#### D. Start Backend Server

```bash
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
📚 Study Tracker API Server
🚀 Running on port 5000
```

Keep this terminal running!

### 3. Frontend Setup

Open a **new terminal** window/tab:

```bash
cd frontend
```

#### Option A: Using Python (Easiest)

```bash
# Python 3
python -m http.server 3000

# Or Python 2
python -m SimpleHTTPServer 3000
```

#### Option B: Using Node.js

```bash
# Install http-server globally (one time only)
npm install -g http-server

# Start server
http-server -p 3000
```

#### Option C: Using VS Code Live Server

1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 4. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the login page!

## First Time Usage

### Create Your Account

1. Click "Create Account"
2. Choose a username (3-30 characters)
3. Enter your email
4. Create a password (minimum 6 characters)
5. Click "Create Account"

### Add Your First Task

1. You'll be redirected to the dashboard
2. Click "Add Task" button
3. Fill in:
   - Subject (e.g., "Mathematics", "Physics")
   - Start time
   - End time
   - Notes (optional)
4. Click "Add Task"

### Explore Features

- **Dashboard**: View today's stats, weekly progress, and streak
- **My Tasks**: Manage all your study sessions
- **Study Timer**: Use the Pomodoro timer (25 min focus, 5 min break)
- **Analytics**: See detailed breakdowns by subject
- **Dark Mode**: Click the moon/sun icon in the header

## Troubleshooting

### Backend won't start

**Error: `MongoDB connection failed`**
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, check your connection string and network access

**Error: `Port 5000 already in use`**
- Another app is using port 5000
- Change `PORT=5001` in `.env`
- Update `API_URL` in frontend JS files to match

### Frontend shows connection errors

**Error: `Failed to fetch` or `Network Error`**
- Make sure backend is running on port 5000
- Check that both servers are running
- Verify `API_URL` in frontend JavaScript files

**Can't login/signup**
- Open browser console (F12)
- Check for error messages
- Verify backend is responding at `http://localhost:5000/health`

### MongoDB Issues

**Can't connect to local MongoDB**
```bash
# Create data directory if it doesn't exist
mkdir -p /data/db

# On Windows
mkdir C:\data\db
```

**MongoDB Atlas connection timeout**
- Add your IP address to Atlas Network Access
- Check your internet connection
- Verify connection string format

## Testing the API

You can test the backend directly using curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Development Tips

### Backend Development

To auto-restart on file changes:
```bash
npm run dev
```

### View Database

**MongoDB Compass** (GUI):
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- Browse the `study-tracker` database

**MongoDB Shell**:
```bash
mongosh
use study-tracker
db.users.find()
db.tasks.find()
```

## Next Steps

### Production Deployment

For deploying to production:

1. **Backend** (Heroku/Railway/Render):
   - Set environment variables
   - Use MongoDB Atlas for database
   - Set `NODE_ENV=production`

2. **Frontend** (Netlify/Vercel):
   - Update `API_URL` to your backend URL
   - Deploy static files

### Customization

- **Colors**: Edit CSS variables in `frontend/css/styles.css`
- **Timer durations**: Modify `TIMER_MODES` in `frontend/js/timer.js`
- **API endpoints**: Add new routes in `backend/routes/`

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review error messages in:
   - Terminal (backend)
   - Browser console (frontend)
3. Verify all prerequisites are installed
4. Make sure all servers are running

## Common Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with auto-reload

# Frontend
cd frontend
python -m http.server 3000    # Start with Python
http-server -p 3000           # Start with Node

# MongoDB
mongod                        # Start MongoDB
mongosh                       # Open MongoDB shell
brew services start mongodb-community  # macOS
```

## Default Credentials

No default credentials - you create your own account!

---

**🎉 Congratulations!** You're ready to start tracking your study progress!

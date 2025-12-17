# EduStat - Student Performance Tracker

A comprehensive web application for University Professors and HODs to track and visualize student performance across multiple coding platforms (GitHub, LeetCode, HackerRank, LinkedIn) in a centralized dashboard.

## 🚀 Features

- **Student Onboarding**: Register students with platform usernames (validated in real-time)
- **Centralized Dashboard**: View all students with sortable### Performance Score Calculation

The "Performance Score" is a compound metric calculated from:

1.  **LeetCode Performance:**
    *   Easy problems: **1 point**
    *   Medium problems: **3 points**
    *   Hard problems: **5 points**

2.  **GitHub Activity:**
    *   Total Contributions: **0.2 points** per contribution

3.  **HackerRank (Legacy):**
    *   Points: **0.1** per point
    *   Badges: **10 points** per badge

The final score is the sum of these weighted components.gorithm combining all platform metrics
- **Data Visualization**: Charts for language distribution and platform stats
- **Export Functionality**: Download student data as CSV

## 📋 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Shadcn/UI components
- Recharts (data visualization)
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Node-cron (scheduling)
- Puppeteer (web scraping)
- Octokit (GitHub API)

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- GitHub Personal Access Token ([Get one here](https://github.com/settings/tokens))

### Installation Steps

1. **Clone the repository**
```bash
cd edustat
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. **Configure environment variables**

**Server** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/edustat
GITHUB_TOKEN=your_github_personal_access_token
LEETCODE_API_URL=https://alfa-leetcode-api.onrender.com
PORT=5000
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**

From the root directory:
```bash
# Development mode (runs both client and server)
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 📊 Usage

### Adding a Student
1. Navigate to the dashboard
2. Click "Add Student" button
3. Fill in student details and platform usernames
4. Submit (usernames will be validated before creation)

### Viewing Performance
- **Dashboard**: Overview of all students with key metrics
- **Student Detail**: Click "View" to see detailed stats, charts, and platform links
- **Filters**: Use batch, section, or search to find specific students

### Data Management
- **Manual Refresh**: Update individual student data on their detail page
- **Bulk Refresh**: Refresh all students from the dashboard
- **Export**: Download current view as CSV

## 🔄 Background Worker

The cron worker automatically updates all student data daily at 2:00 AM. This ensures:
- No API rate limiting during user interactions
- Fresh data available each morning
- Distributed load on external APIs

## 🌐 Deployment (Render)

### Render Configuration

1. **Create a new Web Service**
   - Connect your GitHub repository
   - Use the following settings:

**Build Command**:
```bash
npm install && cd client && npm install && cd ../server && npm install && cd ../client && npm run build
```

**Start Command**:
```bash
cd server && npm start
```

2. **Environment Variables**:
Add all server environment variables in Render dashboard:
- `MONGODB_URI` (use MongoDB Atlas connection string)
- `GITHUB_TOKEN`
- `LEETCODE_API_URL`
- `NODE_ENV=production`

3. **Static Files**:
Configure Render to serve client build from `client/dist`:
- Add rewrite rule: `/* -> /index.html`

### MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add your Render IP to Network Access whitelist
3. Copy connection string to `MONGODB_URI`

## 📁 Project Structure

```
edustat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   └── ui/        # Shadcn/UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities & API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # External API integrations
│   ├── workers/           # Cron jobs
│   ├── server.js
│   └── package.json
└── package.json           # Root workspace config
```

## 🔧 API Endpoints

### Students
- `GET /api/students` - Get all students (supports ?batch=2021&section=A&search=name)
- `POST /api/students` - Create student (validates usernames)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/refresh` - Manually refresh student data

### Health
- `GET /api/health` - Server health check

## ⚠️ Important Notes

1. **GitHub Token**: Required for GitHub API access. Without it, GitHub stats won't be fetched.
2. **HackerRank Scraping**: This is fragile and may break if HackerRank changes their HTML. Consider it best-effort.
3. **Rate Limiting**: The worker includes delays between requests to avoid rate limits.
4. **No Authentication**: This is a public service. Add authentication if needed for production.

## 🐛 Troubleshooting

**MongoDB Connection Failed**:
- Ensure MongoDB is running locally or check Atlas credentials
- Verify network access in MongoDB Atlas

**GitHub API Errors**:
- Check if `GITHUB_TOKEN` is set correctly
- Verify token has necessary permissions

**LeetCode API Not Working**:
- The public alfa-leetcode-api may be down
- Consider deploying your own instance

**Puppeteer Errors**:
- Ensure Chrome/Chromium dependencies are installed
- On Render, use buildpack: `https://github.com/jontewks/puppeteer-heroku-buildpack`

## 📝 License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for education

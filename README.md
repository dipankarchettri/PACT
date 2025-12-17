# PACT - Performance Analytics & Code Tracker

PACT is a centralized dashboard for educators to monitor student programming progress by aggregating real-time statistics from LeetCode and GitHub into a comprehensive analytics platform.

## 🚀 Features

- **Student Onboarding**: Register students with platform usernames (validated in real-time)
- **Centralized Dashboard**: View all students with sortable LeetCode and GitHub metrics.
- **Performance Score Calculation**: A unified metric combining:
  - **LeetCode**: Weighted score based on Easy (1pt), Medium (3pt), and Hard (5pt) problems.
  - **GitHub**: Points for contributions (0.2pt) and stars earned.
- **Data Visualization**: Interactive charts for submission trends and language distribution.
- **Export Functionality**: Download student data as CSV.
- **Cron Jobs**: Automated daily data fetching to ensure fresh analytics.

## 📋 Tech Stack

### Frontend

- React.js (Vite)
- Tailwind CSS
- Shadcn/UI components
- Recharts / Google Charts
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- Node-cron (scheduling)
- Octokit (GitHub API)

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- GitHub Personal Access Token ([Get one here](https://github.com/settings/tokens))

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/dipankarchettri/PACT.git
cd pact-analytics
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

## 🔧 API Endpoints

### Students

- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/refresh` - Manually refresh student data

### Health

- `GET /api/health` - Server health check

## 📝 License

MIT

---

Built with ❤️ for education

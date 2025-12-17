# Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] GitHub Personal Access Token created

## Step 1: Install Dependencies

From the `pact-analytics` directory:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Configure Environment

Create `.env` files:

**server/.env**:

```env
MONGODB_URI=mongodb://localhost:27017/pact
GITHUB_TOKEN=your_github_token_here

PORT=5000
NODE_ENV=development
```

**client/.env**:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

If using local MongoDB:

```bash
mongod
```

Or use MongoDB Atlas connection string in `.env`

## Step 4: Run the Application

From the root `pact-analytics` directory:

```bash
# Option 1: Run both servers concurrently
npm run dev

# Option 2: Run separately (two terminals)
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Access the app at **http://localhost:5173**

## Step 5: Test the Features

1. Click **Add Student**
2. Enter student details with valid GitHub/LeetCode usernames
3. Submit (validation will occur)
4. View the dashboard table
5. Click **View** on a student for detailed stats
6. Test **Refresh Data** and **Export CSV**

## Troubleshooting

**MongoDB connection error**:

- Check MongoDB is running
- Verify MONGODB_URI is correct

**GitHub API errors**:

- Ensure GITHUB_TOKEN is set in server/.env
- Get token at: https://github.com/settings/tokens

**Port conflicts**:

- Change PORT in server/.env
- Change port in client/.env VITE_API_URL

---

**Need help?** Check the full [README.md](file:///home/diredi/Desktop/College%20Projects/edustat/README.md)

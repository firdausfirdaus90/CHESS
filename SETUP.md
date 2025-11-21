# Chess Game with Claude AI - Setup Guide

This guide will walk you through setting up your chess application with Firebase authentication, Firestore database, and Claude AI integration deployed on Vercel.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- Google account (for Firebase)
- Anthropic account (for Claude API)
- GitHub account (for Vercel deployment)

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `chess-game` (or your preferred name)
4. Disable Google Analytics (not needed for this project)
5. Click "Create project"

### 1.2 Enable Firebase Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" under "Sign-in method"
4. Enable "Email/Password"
5. Click "Save"
6. Click on "Users" tab
7. Click "Add user"
8. Enter your email and password (this will be your login)
9. Click "Add user"

### 1.3 Create Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a Cloud Firestore location (pick closest to you)
5. Click "Enable"

### 1.4 Set Firestore Security Rules

1. In Firestore Database, click "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 1.5 Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`)
5. Register app name: `chess-game`
6. Click "Register app"
7. Copy the `firebaseConfig` object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "chess-game-xxxxx.firebaseapp.com",
  projectId: "chess-game-xxxxx",
  storageBucket: "chess-game-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

8. Open `src/config/firebase.js` in your code
9. Replace the placeholder config with your actual config

---

## Step 2: Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or sign in
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Give it a name like "Chess Game"
6. Copy the API key (starts with `sk-ant-...`)
7. **IMPORTANT:** Save this key somewhere safe - you'll need it for Vercel

---

## Step 3: Install Dependencies

Run this in your project directory:

```bash
npm install
```

This will install:
- `firebase` - Firebase SDK
- `react-router-dom` - For routing
- All other dependencies from package.json

---

## Step 4: Test Locally (Optional)

1. Make sure you've updated `src/config/firebase.js` with your Firebase config
2. Run the development server:

```bash
npm run dev
```

3. Open http://localhost:5173
4. Try logging in with the email/password you created in Firebase
5. Note: Claude AI won't work locally yet (API key is on Vercel)

---

## Step 5: Deploy to Vercel

### 5.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com/)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 5.2 Push Code to GitHub

1. Commit all your changes:

```bash
git add .
git commit -m "Add Firebase auth and Claude AI integration"
git push origin main
```

### 5.3 Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Find your `CHESS` repository and click "Import"
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (should be auto-detected)
   - **Output Directory:** `dist` (should be auto-detected)

5. Click "Deploy"

### 5.4 Add Environment Variable

1. After deployment, go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in the left sidebar
4. Add a new variable:
   - **Name:** `CLAUDE_API_KEY`
   - **Value:** Your Claude API key (from Step 2)
   - **Environment:** Select all (Production, Preview, Development)
5. Click "Save"

### 5.5 Redeploy

1. Go to "Deployments" tab
2. Click on the three dots (⋮) on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

---

## Step 6: Access Your Chess Game

1. Your app will be live at: `https://your-project-name.vercel.app`
2. Login with the email/password you created in Firebase
3. Start playing chess!

### Features:
- ✅ **Minimax AI** - Free, runs in browser
- ✅ **Claude AI** - Smart AI powered by Claude API
- ✅ **Game History** - All games saved to Firestore
- ✅ **Statistics** - View wins, losses, and game modes
- ✅ **Secure** - Login required, API key hidden on server

---

## Costs

### Firebase (Free Tier)
- Authentication: Free
- Firestore: 50,000 reads/day, 20,000 writes/day (FREE)
- More than enough for personal use

### Vercel (Free Tier)
- Hosting: FREE
- Serverless Functions: 100GB-hrs/month (FREE)
- Bandwidth: 100GB/month (FREE)

### Claude API (Pay-as-you-go)
- Cost per game (20 moves): ~$0.06-$0.30
- Monthly cost (playing daily): ~$2-$10
- You can toggle to Minimax AI anytime to avoid costs

### Total: $0-$10/month

---

## Troubleshooting

### Can't login
- Check that you created a user in Firebase Authentication
- Verify Firebase config in `src/config/firebase.js` is correct
- Check browser console for errors

### Claude AI not working
- Verify `CLAUDE_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for errors
- Make sure you have API credits in Anthropic account
- Try using Minimax AI instead

### Game history not saving
- Check Firestore security rules (see Step 1.4)
- Make sure you're logged in
- Check browser console for errors

### Deployment failed
- Check build logs in Vercel
- Make sure all dependencies are in `package.json`
- Verify `vite.config.js` has correct base path

---

## Security Notes

- ✅ Your Claude API key is stored securely on Vercel (never exposed to browser)
- ✅ Only authenticated users can access the app
- ✅ Only authenticated users can read/write game data
- ✅ API key is only accessible by your Vercel serverless functions

---

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check Vercel deployment logs
3. Check Firebase console for authentication/database errors
4. Verify all configuration steps were completed

---

## Customization

### Change your login email
1. Go to Firebase Console → Authentication → Users
2. Add or edit users

### Disable Claude AI completely
1. Remove "Claude AI" option from the select dropdown in `App.jsx`
2. Set `aiType` default to `'minimax'`

### Customize game timer
1. Edit `whiteTime` and `blackTime` initial values in `App.jsx`
2. Default is 600 seconds (10 minutes)

---

Enjoy your chess game! 🎮♟️

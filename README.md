<div align="center">

  <img src="frontend/public/logo.png" alt="XcelFlow Logo" width="100" />

  # ✨ XcelFlow
  ### **Smart Excel Analytics & AI Decision Intelligence Platform**
  *A Product of ZAMYT*

  [![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

  [Live Demo](http://localhost:3000) • [API Documentation](#-api-documentation-reference) • [Deployment Guide](#-deployment-guide)

</div>

---

## 🚀 Overview

**XcelFlow** is a modern, enterprise-grade full-stack platform designed to transform raw spreadsheet datasets (`.xlsx`, `.xls`, `.csv`) into actionable, executive-level business intelligence. 

Powered by high-performance data parsing engines, AI intelligence models, and custom charting tools, XcelFlow enables teams, analysts, and founders to uncover hidden data patterns, model "What-If" business scenarios, generate data story presentations, and automate decisions in seconds.

---

## 🌟 Key Features

### 📊 1. Automated Excel & CSV Ingestion
- Upload `.xlsx`, `.xls`, or `.csv` files up to large limits effortlessly.
- Automatic column type detection, null-cleansing, numeric aggregation, and data previews.

### 🤖 2. AI Data Copilot & Insights Engine
- **Automated Insights**: Instant narrative summaries explaining business growth, stability, and risk metrics.
- **Natural Language Q&A**: Ask questions about your dataset in plain language and receive precise, data-backed answers.

### 📈 3. Interactive Visualizations & Charting
- Dynamic chart generation (Pie, Bar, Line, Area, Radar, Health Gauges).
- Real-time chart configuration, custom color themes, data filtering, and high-res PNG image exports.

### 🔮 4. Predictive Forecasting & Decision Simulator
- **Scenario Simulator**: Simulate price adjustments, discount variations, or marketing spend to see real-time impact on revenue and margins.
- **Predictive Forecasts**: Trend projection modeling based on historical spreadsheet timelines.

### 📖 5. Data Story Mode & Workflow Advisor
- Turn spreadsheet rows into visually appealing narrative presentation slides.
- Automated suggestions for data pipeline optimization and business growth.

### 👑 6. Full Administrative Suite & Contact Hub
- **Admin Control Panel**: Real-time user metrics, file analytics, contact message management with "Mark as Replied / Unreplied" workflows.
- **In-App Password Management**: Super-admin account password change interface.
- **Email Forwarding**: Instant Nodemailer integration forwarding client inquiries directly to admin email (`aksainikhedla04@gmail.com`).

### 📱 7. Responsive Glassmorphism Design
- Pinned **Sticky Sidebar Layout** for effortless navigation across long dashboards.
- Fully responsive mobile drawer navigation with quick access **Login/Sign-In** action buttons.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 (SPA)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, Vanilla CSS Glassmorphism
- **Charts**: Chart.js, Recharts, Custom Canvas Gauges
- **Icons**: Lucide React, Heroicons

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & Bcryptjs password hashing
- **File Parsing**: ExcelJS, XLSX, Multer
- **Email Service**: Nodemailer (SMTP Gmail integration)

---

## 📁 Repository Structure

```
XcelFlow/
├── backend/
│   ├── middleware/        # Auth & Upload Middlewares
│   ├── models/            # Mongoose Schemas (User, DataRow, FileMeta, ContactMessage)
│   ├── routes/            # REST API Endpoint Handlers
│   ├── utils/             # User Deletion & Helper Utilities
│   ├── seedAdmin.js       # Admin Account Seeder Script
│   ├── server.js          # Express Application Entry Point
│   ├── vercel.json        # Vercel Deployment Configuration
│   └── .env.example       # Backend Environment Template
├── frontend/
│   ├── public/
│   │   ├── _redirects     # Netlify SPA Routing Configuration
│   │   ├── logo.png       # Official XcelFlow Logo Asset
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # Reusable UI Components & Layouts
│   │   ├── pages/         # Page Views (Dashboard, Upload, Admin, etc.)
│   │   ├── utils/         # Utility Helpers & Chart Generators
│   │   ├── App.js         # Master Route Router
│   │   └── index.css      # Tailwind & Global Styles
│   └── .env.example       # Frontend Environment Template
├── .gitignore             # Root Security Protection
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/amitchauhan004/Excel-Analytics-Platform.git
cd Excel-Analytics-Platform
```

---

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
```

Configure your `backend/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel_analytics
JWT_SECRET=your_super_secret_jwt_key
OPENROUTER_API_KEY=your_openrouter_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_16_digit_app_password
NOTIFICATION_EMAIL=aksainikhedla04@gmail.com
CLIENT_URL=http://localhost:3000
```

Seed the default Admin Account:
```bash
node seedAdmin.js
```

Start the Backend Server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

---

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# App will open at http://localhost:3000
```

---

## 📡 API Documentation Reference

### 🔐 Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User authentication & JWT issuance
- `POST /api/auth/google` — Google OAuth authentication
- `PUT /api/auth/update` — Update user profile details
- `DELETE /api/auth/delete-account` — Complete account deletion

### 📁 File Management & Ingestion
- `POST /api/upload` — Upload `.xlsx`, `.xls`, or `.csv` dataset
- `GET /api/files` — Retrieve user's uploaded files list
- `DELETE /api/files/:id` — Delete specific file & associated data rows
- `GET /api/files/download/:filename` — Download original dataset file

### 🤖 Intelligence & Analytics
- `GET /api/dashboard/stats` — High-level user dashboard analytics
- `GET /api/insights/:fileId/analyze` — Generate AI summary & insights
- `POST /api/ai/query` — Natural Language AI Data Copilot Q&A
- `POST /api/simulate` — Perform "What-If" scenario simulations
- `GET /api/forecast/:fileId` — Generate predictive timeline forecasts

### 📩 Contact & Admin Control
- `POST /api/contact` — Submit public inquiry (Saves to DB & emails admin)
- `GET /api/contact` — Fetch all contact inquiries *(Admin Only)*
- `PUT /api/contact/:id/status` — Mark inquiry status (`unread`, `read`, `replied`)
- `PUT /api/admin/change-password` — Change admin account password *(Admin Only)*

---

## 🌐 Deployment Guide

### **Frontend on Netlify**
1. Import repository to **Netlify**.
2. **Base Directory**: `frontend` | **Build Command**: `npm run build` | **Publish Directory**: `frontend/build`.
3. Add Environment Variable:
   - `REACT_APP_API_BASE_URL` = `https://your-backend-domain.com/api/`
4. *(Included `frontend/public/_redirects` ensures seamless client-side routing).*

### **Backend on Vercel or Render**
1. **Render.com** *(Recommended)*:
   - Create Web Service | Root Directory: `backend` | Command: `node server.js`.
   - Add environment variables (`MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, etc.).
2. **Vercel**:
   - Import `backend` directory. Configured via included `backend/vercel.json`.

---

## 🛡️ Security Audit
- All private keys, database credentials, and SMTP credentials are encapsulated inside `.env` variables.
- Multi-tier `.gitignore` ensures zero credential leaks to public repositories.
- Role-based authorization middleware (`authMiddleware`, `adminMiddleware`) enforces secure access control.

---

## 🤝 Contributing & Support

Contributions are welcome! If you'd like to improve XcelFlow, feel free to fork the repo and submit a PR.

- **Email Support**: [support@zamyt.in](mailto:support@zamyt.in)
- **Developed By**: ZAMYT Team

---

<div align="center">
  <sub>Built with ❤️ for intelligent data analytics. © 2025 XcelFlow • A ZAMYT Product. All rights reserved.</sub>
</div>

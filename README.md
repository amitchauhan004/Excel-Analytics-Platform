# Excel Analytics Platform

A full-stack web application for uploading, analyzing, and visualizing Excel data with AI-powered insights.

## Features

- 📊 **File Upload**: Upload Excel (.xlsx, .xls) and CSV files
- 🔐 **User Authentication**: Secure login/register with JWT tokens
- 📈 **Data Visualization**: Interactive charts and graphs
- 🤖 **AI Insights**: AI-powered data analysis and insights
- 👥 **User Management**: Admin panel for user management
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **ExcelJS** for Excel file processing
- **OpenAI API** for AI insights

### Frontend
- **React.js** with React Router
- **Axios** for API calls
- **Chart.js** for data visualization
- **Tailwind CSS** for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/excel-analytics
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   GOOGLE_CLIENT_ID=your-google-client-id (optional)
   EMAIL_USER=your-email@gmail.com (optional)
   EMAIL_PASS=your-email-password (optional)
   FRONTEND_URL=http://localhost:3000
   OPENAI_API_KEY=your-openai-api-key (optional)
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Issues Fixed

### 1. **Duplicate Server Files**
- Removed duplicate `index.js` file that was conflicting with `server.js`

### 2. **Empty Component Files**
- Created functional `DataTable.js` component for displaying uploaded data
- Created reusable `FileUploader.js` component for file uploads
- Created `ChartCard.js` component for displaying charts

### 3. **Authentication Issues**
- Fixed authentication middleware usage
- Ensured proper JWT token handling
- Added proper error handling for authentication failures

### 4. **File Upload Issues**
- Fixed file upload route configuration
- Improved error handling in upload process
- Added proper file type validation

### 5. **Data Display Issues**
- Fixed DataView page to properly handle authentication
- Improved data fetching with proper error handling
- Added pagination for large datasets

### 6. **AI Insights Component**
- Fixed API URL configuration
- Improved error handling and loading states
- Enhanced UI for better user experience

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `PUT /api/auth/update` - Update user profile
- `DELETE /api/auth/delete-account` - Delete user account

### File Management
- `POST /api/upload` - Upload Excel file
- `GET /api/files` - Get user's files
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/download/:filename` - Download file

### Data Analysis
- `GET /api/data` - Get user's data
- `GET /api/data/file/:fileId` - Get specific file data
- `GET /api/insights/:fileId/analyze` - Get AI insights

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-files` - Get recent files

## File Structure

```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Files**: Upload your Excel or CSV files
3. **View Data**: Browse and view your uploaded data
4. **Analyze**: Use the analysis tools to visualize your data
5. **Get Insights**: Use AI-powered insights for data analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

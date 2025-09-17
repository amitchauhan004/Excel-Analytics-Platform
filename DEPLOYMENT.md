# Vercel Deployment Guide

## Environment Variables Required

Make sure to set these environment variables in your Vercel dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://your-frontend-url.vercel.app
API_URL=https://your-backend-url.vercel.app
NODE_ENV=production
```

## Key Changes Made for Vercel Deployment

1. **Created `vercel.json`** - Configuration for serverless functions
2. **Modified `server.js`** - Added serverless compatibility
3. **Updated CORS** - Added production origins
4. **Fixed file uploads** - Uses memory storage in production
5. **Added health check** - `/api/health` endpoint
6. **Database connection** - Added timeout settings for serverless

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

## Important Notes

- File downloads are disabled in production (serverless environment)
- Files are processed and stored in database only
- Make sure your MongoDB connection string is correct
- Update the frontend URL in the CORS configuration

## Testing

After deployment, test these endpoints:
- `GET /api/health` - Should return status OK
- `POST /api/auth/login` - Test authentication
- `POST /api/upload` - Test file upload (files won't be downloadable)

# Deployment Guide

## Overview
This guide covers the deployment process for the MERN Chat Application to production environments.

## Prerequisites

### Required Accounts
- [GitHub](https://github.com) - Source code repository
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database hosting
- [Render](https://render.com) - Backend hosting
- [Vercel](https://vercel.com) - Frontend hosting

### Required Tools
- Node.js 16+
- npm or yarn
- Git

## Environment Variables

### Backend Environment Variables (Render)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE=5000000
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables (Vercel)
```env
VITE_API_URL=https://your-backend-app.render.com/api
VITE_SOCKET_URL=https://your-backend-app.render.com
VITE_APP_NAME=Chat Application
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_EMOJI_PICKER=true
```

## Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your application's IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get the connection string

### 2. Backend Deployment (Render)

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your app

2. **Configure Build Settings**
   - **Name**: `mern-chat-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   - Add all backend environment variables listed above
   - Make sure to use the MongoDB Atlas connection string

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://your-app-name.render.com`)

### 3. Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Connect GitHub Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   - Add all frontend environment variables
   - Use the Render backend URL in `VITE_API_URL` and `VITE_SOCKET_URL`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the domain (e.g., `https://your-app-name.vercel.app`)

### 4. Update CORS Settings

After both deployments are complete:

1. **Update Backend Environment Variables**
   - Go back to Render dashboard
   - Update `CLIENT_URL` and `SOCKET_CORS_ORIGIN` with your Vercel domain
   - Redeploy the service

## Custom Domain Setup (Optional)

### Backend (Render)
1. Go to your service settings on Render
2. Click "Custom Domains"
3. Add your domain and follow DNS configuration instructions

### Frontend (Vercel)
1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your domain and follow DNS configuration instructions

## SSL/HTTPS

Both Render and Vercel provide automatic SSL certificates:
- **Render**: Automatic Let's Encrypt certificates
- **Vercel**: Automatic SSL for all deployments

## Monitoring URLs

After deployment, your application will be available at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.render.com/api`
- **Health Check**: `https://your-app-name.render.com/health`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_URL` in backend matches frontend domain exactly
   - Check that both HTTP and HTTPS are handled correctly

2. **Socket.io Connection Issues**
   - Verify `VITE_SOCKET_URL` points to backend domain
   - Ensure WebSocket connections are allowed by hosting provider

3. **Database Connection Issues**
   - Check MongoDB Atlas connection string
   - Verify IP whitelist includes hosting provider IPs
   - Ensure database user has correct permissions

4. **Build Failures**
   - Check build logs in hosting dashboard
   - Verify all dependencies are listed in package.json
   - Ensure environment variables are set correctly

### Logs Access

- **Render**: Available in service dashboard under "Logs"
- **Vercel**: Available in project dashboard under "Functions" tab

## Rollback Procedure

### Automatic Rollback
Both platforms support automatic rollback:
- **Render**: Use "Rollback" button in deployment history
- **Vercel**: Use "Rollback" button in deployment list

### Manual Rollback
1. Revert changes in GitHub repository
2. Push to main branch
3. Automatic deployment will trigger

## Performance Optimization

### Backend (Render)
- Use environment variable `NODE_ENV=production`
- Enable gzip compression
- Implement proper caching headers
- Monitor memory usage and upgrade plan if needed

### Frontend (Vercel)
- Static assets are automatically cached
- Images are automatically optimized
- CDN distribution is included
- Enable compression in Vite build

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to repository
   - Use different secrets for each environment
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Limit IP access when possible
   - Enable MongoDB audit logs

3. **API Security**
   - JWT tokens should be strong and rotated
   - Implement rate limiting
   - Use HTTPS only

4. **Frontend Security**
   - Never expose API keys in client code
   - Implement Content Security Policy
   - Use secure headers

# 🚀 MERN Chat Application - Production Ready

[![Deploy Status](https://img.shields.io/badge/deploy-ready-green.svg)](https://github.com/your-username/your-repo)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io, ready for production deployment.

## 🌟 Features

- **Real-time messaging** with Socket.io
- **User authentication** with JWT
- **File upload** support
- **Emoji picker** integration
- **Typing indicators**
- **Online user status**
- **Message history** with pagination
- **Responsive design** with Tailwind CSS
- **Production-ready** with security headers
- **Health monitoring** endpoints
- **Error tracking** integration
- **Docker support**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Client  │◄──►│  Express.js API │◄──►│ MongoDB Atlas   │
│   (Vercel)      │    │   (Render)      │    │   (Cloud DB)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         └───────────────────────┘
              Socket.io WebSocket
```

## 🚀 Live Demo

- **Frontend**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app) *(Update with your actual URL)*
- **Backend API**: [https://your-app-name.render.com/api](https://your-app-name.render.com/api) *(Update with your actual URL)*
- **Health Check**: [https://your-app-name.render.com/health](https://your-app-name.render.com/health) *(Update with your actual URL)*

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account
- Git

## ⚡ Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/PLP-MERN-Stack-Development/week-7-devops-deployment-assignment-KamungeD.git
cd week-7-devops-deployment-assignment-KamungeD

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Environment Configuration

Update the environment files created by the setup script:

**Server (.env)**:
```env
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

**Client (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Chat Application
```

### 3. Development

```bash
# Start both client and server
npm run dev

# Or start individually
npm run server:dev  # Server only
npm run client:dev  # Client only
```

## 🐳 Docker Development

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Prerequisites
- [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Render](https://render.com) account for backend
- [Vercel](https://vercel.com) account for frontend

### Step-by-Step Deployment Guide

Detailed deployment instructions are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### Quick Deploy Summary

1. **Database Setup** (MongoDB Atlas)
   - Create cluster and get connection string

2. **Backend Deploy** (Render)
   - Connect GitHub repo
   - Set environment variables
   - Deploy from `server` directory

3. **Frontend Deploy** (Vercel)
   - Connect GitHub repo
   - Set environment variables
   - Deploy from `client` directory

4. **Update CORS Settings**
   - Update backend `CLIENT_URL` with frontend domain

## 🔧 CI/CD Pipeline

The application includes GitHub Actions workflows for:

- **Continuous Integration**: Automated testing and linting
- **Continuous Deployment**: Automatic deployment on push to main
- **Security Scanning**: Dependency vulnerability checks
- **Health Monitoring**: Automated uptime checks

View workflow files in [`.github/workflows/`](.github/workflows/)

## 📊 Monitoring & Health Checks

### Health Endpoints
- `/health` - Basic server health
- `/api/health` - Detailed system health with database status

### Monitoring Setup
Comprehensive monitoring guide available in [docs/MONITORING.md](docs/MONITORING.md)

**Recommended Tools**:
- [UptimeRobot](https://uptimerobot.com) - Uptime monitoring
- [Sentry](https://sentry.io) - Error tracking
- [Render Analytics](https://render.com) - Server metrics
- [Vercel Analytics](https://vercel.com) - Frontend performance

## 🛡️ Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- CORS protection
- Security headers (XSS, CSRF, etc.)
- Input validation and sanitization
- File upload restrictions
- Rate limiting ready
- Environment variable protection

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API services
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── server/                # Express.js backend
│   ├── config/           # Database config
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── uploads/          # File uploads
├── docs/                 # Documentation
├── scripts/              # Deployment scripts
├── .github/workflows/    # CI/CD workflows
└── docker-compose.yml    # Docker configuration
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Performance

### Key Metrics
- **Backend**: < 200ms average response time
- **Frontend**: < 2.5s Largest Contentful Paint
- **Database**: Optimized with proper indexing
- **WebSocket**: Real-time messaging with < 100ms latency

### Optimization Features
- Code splitting and lazy loading
- Image optimization
- Static asset caching
- Database connection pooling
- Gzip compression

## 🔄 Environment Management

| Environment | Frontend URL | Backend URL | Database |
|-------------|--------------|-------------|----------|
| Development | http://localhost:3000 | http://localhost:5000 | Local MongoDB |
| Staging | https://staging.vercel.app | https://staging.render.com | Atlas Staging |
| Production | https://your-app.vercel.app | https://your-app.render.com | Atlas Production |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run install:all` - Install all dependencies

### Server Scripts
- `npm run server:dev` - Start server in development
- `npm run server:start` - Start server in production
- `npm run server:prod` - Start with production environment

### Client Scripts
- `npm run client:dev` - Start client development server
- `npm run client:build` - Build client for production
- `npm run client:preview` - Preview production build

## 🚨 Troubleshooting

### Common Issues

**Connection Errors**
```bash
# Check health endpoints
curl https://your-backend.render.com/health
curl https://your-backend.render.com/api/health
```

**Environment Variables**
- Ensure all required variables are set in hosting platforms
- Check that URLs match between frontend and backend

**CORS Issues**
- Verify `CLIENT_URL` in backend matches frontend domain exactly
- Check that both HTTP and HTTPS are handled correctly

**Build Failures**
- Check build logs in hosting platform dashboards
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

### Getting Help

1. Check the [docs](docs/) directory for detailed guides
2. Review GitHub Issues for common problems
3. Check hosting platform status pages
4. Review application logs for error details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) for real-time communication
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Render](https://render.com) for backend hosting
- [Vercel](https://vercel.com) for frontend hosting
- [React](https://reactjs.org/) and [Express.js](https://expressjs.com/) communities

---

## 📞 Support

For support and questions:
- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 💬 Issues: [GitHub Issues](https://github.com/PLP-MERN-Stack-Development/week-7-devops-deployment-assignment-KamungeD/issues)
- 📖 Docs: [Documentation](docs/)

**Built with ❤️ for the PLP MERN Stack Development Course**

## CI/CD Pipeline

The assignment includes templates for setting up GitHub Actions workflows:
- `frontend-ci.yml`: Tests and builds the React application
- `backend-ci.yml`: Tests the Express.js backend
- `frontend-cd.yml`: Deploys the frontend to your chosen platform
- `backend-cd.yml`: Deploys the backend to your chosen platform

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete all deployment tasks
2. Set up CI/CD pipelines with GitHub Actions
3. Deploy both frontend and backend to production
4. Document your deployment process in the README.md
5. Include screenshots of your CI/CD pipeline in action
6. Add URLs to your deployed applications

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/) 
# Monitoring and Maintenance Guide

## Application Monitoring

### Health Check Endpoints

The application provides several health check endpoints:

1. **Basic Health Check**
   - URL: `https://your-backend.render.com/health`
   - Returns: Server status and uptime
   - Use: Basic connectivity check

2. **Detailed Health Check**
   - URL: `https://your-backend.render.com/api/health`
   - Returns: Server status, database connection, memory usage
   - Use: Comprehensive system health assessment

### Monitoring Tools

#### 1. Render Built-in Monitoring
- **Access**: Render Dashboard → Your Service → Metrics
- **Metrics Available**:
  - CPU usage
  - Memory usage
  - HTTP requests
  - Response times
  - Error rates

#### 2. Vercel Analytics
- **Access**: Vercel Dashboard → Your Project → Analytics
- **Metrics Available**:
  - Page views
  - Unique visitors
  - Core Web Vitals
  - Error tracking

#### 3. External Monitoring Services

**Recommended Services:**
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Pingdom](https://www.pingdom.com) - Website performance monitoring
- [Sentry](https://sentry.io) - Error tracking and performance monitoring

**Setup Instructions for UptimeRobot:**
1. Create account at UptimeRobot
2. Add monitors for:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-backend.render.com/health`
   - API: `https://your-backend.render.com/api/health`
3. Configure alerts (email, SMS, Slack)

## Error Tracking Setup

### Sentry Integration

#### Backend Setup
1. Install Sentry SDK:
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

2. Add to server.js:
   ```javascript
   const Sentry = require("@sentry/node");
   const Tracing = require("@sentry/tracing");

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     integrations: [
       new Sentry.Integrations.Http({ tracing: true }),
       new Tracing.Integrations.Express({ app }),
     ],
     tracesSampleRate: 1.0,
   });

   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   
   // Error handler
   app.use(Sentry.Handlers.errorHandler());
   ```

#### Frontend Setup
1. Install Sentry SDK:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. Add to main.jsx:
   ```javascript
   import * as Sentry from "@sentry/react";
   import { Integrations } from "@sentry/tracing";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     integrations: [
       new Integrations.BrowserTracing(),
     ],
     tracesSampleRate: 1.0,
   });
   ```

## Performance Monitoring

### Key Metrics to Monitor

#### Backend Metrics
- **Response Time**: < 200ms for API calls
- **Memory Usage**: < 80% of allocated memory
- **CPU Usage**: < 70% average
- **Database Query Time**: < 50ms average
- **Error Rate**: < 1% of total requests
- **Uptime**: > 99.9%

#### Frontend Metrics
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s

### Performance Optimization

#### Backend Optimization
1. **Database Indexing**
   ```javascript
   // Add indexes for frequently queried fields
   db.messages.createIndex({ createdAt: -1 });
   db.messages.createIndex({ room: 1, createdAt: -1 });
   db.users.createIndex({ email: 1 }, { unique: true });
   ```

2. **Caching Strategy**
   ```javascript
   // Implement Redis caching for frequently accessed data
   const redis = require('redis');
   const client = redis.createClient(process.env.REDIS_URL);
   ```

3. **Connection Pooling**
   ```javascript
   // MongoDB connection pooling
   mongoose.connect(process.env.MONGODB_URI, {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   });
   ```

#### Frontend Optimization
1. **Code Splitting**
   ```javascript
   // Implement lazy loading for routes
   const ChatPage = lazy(() => import('./pages/ChatPage'));
   const ProfilePage = lazy(() => import('./pages/ProfilePage'));
   ```

2. **Image Optimization**
   ```javascript
   // Use WebP format and lazy loading
   <img 
     src={imageUrl} 
     alt="Profile"
     loading="lazy"
     style={{ maxWidth: '100%', height: 'auto' }}
   />
   ```

## Backup and Recovery

### Database Backup Strategy

#### MongoDB Atlas Automatic Backups
- **Frequency**: Continuous backups with point-in-time recovery
- **Retention**: 30 days for M10+ clusters
- **Access**: MongoDB Atlas Dashboard → Clusters → Backup

#### Manual Backup Process
```bash
# Create backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out=backup/

# Restore backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" backup/dbname/
```

### Application Backup
```bash
# Backup uploaded files
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz server/uploads/

# Backup configuration
cp server/.env server/.env.backup.$(date +%Y%m%d)
```

## Maintenance Schedule

### Daily Tasks (Automated)
- Health check monitoring
- Error log review
- Performance metrics check
- Backup verification

### Weekly Tasks
- Security update review
- Performance analysis
- Capacity planning review
- User feedback analysis

### Monthly Tasks
- Full security audit
- Performance optimization review
- Backup testing and recovery drills
- Cost optimization review
- Dependency updates

### Quarterly Tasks
- Complete system architecture review
- Security penetration testing
- Disaster recovery testing
- Business continuity planning review

## Alerting Configuration

### Critical Alerts (Immediate Response)
- Application down (>5 minutes)
- Database connection failure
- Error rate >5%
- Response time >5 seconds
- Memory usage >95%

### Warning Alerts (Next Business Day)
- Error rate >2%
- Response time >2 seconds
- Memory usage >80%
- Disk usage >80%
- SSL certificate expiring <30 days

### Alert Channels
1. **Email**: team@yourcompany.com
2. **Slack**: #alerts channel
3. **SMS**: For critical alerts only
4. **PagerDuty**: For on-call escalation

## Incident Response

### Incident Classification

#### Severity 1 (Critical)
- Complete system outage
- Data breach or security incident
- Database corruption

**Response Time**: Immediate (< 15 minutes)
**Resolution Time**: < 4 hours

#### Severity 2 (High)
- Partial system outage
- Performance degradation affecting >50% users
- Authentication failures

**Response Time**: < 1 hour
**Resolution Time**: < 24 hours

#### Severity 3 (Medium)
- Feature not working for some users
- Performance issues affecting <50% users
- Non-critical API failures

**Response Time**: < 4 hours
**Resolution Time**: < 72 hours

#### Severity 4 (Low)
- Minor UI issues
- Documentation updates needed
- Enhancement requests

**Response Time**: Next business day
**Resolution Time**: Next release cycle

### Incident Response Process

1. **Detection & Alert**
   - Monitor alerts from various sources
   - Log incident in tracking system

2. **Assessment & Classification**
   - Determine severity level
   - Assign incident commander
   - Notify stakeholders

3. **Response & Investigation**
   - Form response team
   - Investigate root cause
   - Implement temporary fixes

4. **Resolution & Recovery**
   - Implement permanent fix
   - Verify system recovery
   - Update monitoring and alerts

5. **Post-Incident Review**
   - Document lessons learned
   - Update procedures
   - Implement preventive measures

## Log Management

### Log Locations
- **Render**: Service Dashboard → Logs
- **Vercel**: Project Dashboard → Functions → Logs
- **MongoDB Atlas**: Atlas Dashboard → Monitoring → Logs

### Log Retention
- **Application Logs**: 30 days
- **Error Logs**: 90 days
- **Security Logs**: 1 year
- **Audit Logs**: 2 years

### Log Analysis Tools
1. **Built-in Platform Tools**
   - Render log viewer
   - Vercel function logs
   - MongoDB Atlas log analysis

2. **External Tools** (if needed)
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - LogRocket for frontend

## Security Monitoring

### Security Checklist

#### Monthly Security Review
- [ ] Review access logs for suspicious activity
- [ ] Check for failed authentication attempts
- [ ] Verify SSL certificate status
- [ ] Review database access patterns
- [ ] Update dependencies with security patches
- [ ] Review environment variable security
- [ ] Check for exposed sensitive data in logs

#### Quarterly Security Audit
- [ ] Penetration testing
- [ ] Vulnerability scanning
- [ ] Code security review
- [ ] Infrastructure security assessment
- [ ] Access control review
- [ ] Backup security verification

### Security Incident Response
1. **Immediate Actions**
   - Isolate affected systems
   - Change all passwords and API keys
   - Review access logs
   - Contact security team

2. **Investigation**
   - Determine scope of breach
   - Identify compromised data
   - Document timeline of events

3. **Recovery**
   - Implement security fixes
   - Restore from clean backups if needed
   - Update security procedures

4. **Notification**
   - Notify affected users
   - Report to relevant authorities
   - Update security documentation

## Cost Optimization

### Monthly Cost Review
- Analyze hosting costs (Render, Vercel)
- Review database usage (MongoDB Atlas)
- Check third-party service costs
- Optimize resource allocation

### Cost Optimization Strategies
1. **Right-sizing Resources**
   - Monitor actual usage vs. allocated resources
   - Scale down unused services
   - Use auto-scaling when available

2. **Database Optimization**
   - Regular query optimization
   - Remove unused indexes
   - Archive old data

3. **CDN and Caching**
   - Implement aggressive caching for static assets
   - Use CDN for global content delivery
   - Enable compression for all responses

## Documentation Maintenance

### Documentation Update Schedule
- **Weekly**: Update deployment status and known issues
- **Monthly**: Review and update monitoring procedures
- **Quarterly**: Complete documentation review and update

### Required Documentation
- [ ] Deployment procedures (this document)
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Environment setup guide
- [ ] Troubleshooting guide
- [ ] Security procedures
- [ ] Backup and recovery procedures

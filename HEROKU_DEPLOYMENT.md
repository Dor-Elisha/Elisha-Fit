# Heroku Deployment Guide for Elisha-Fit

This guide will help you deploy your Elisha-Fit application to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: Prepare Your Application

### 1.1 Environment Variables
Set up your environment variables in Heroku:

```bash
# MongoDB Atlas (Recommended for production)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/elisha-fit"

# JWT Secret
heroku config:set JWT_SECRET="your-super-secret-jwt-key"

# Environment
heroku config:set NODE_ENV="production"
```

### 1.2 MongoDB Atlas Setup (Recommended)
1. Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to Heroku config variables

## Step 2: Deploy to Heroku

### 2.1 Create Heroku App
```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Or use existing app
heroku git:remote -a your-app-name
```

### 2.2 Deploy
```bash
# Add all files to git
git add .

# Commit changes
git commit -m "Deploy to Heroku"

# Push to Heroku
git push heroku main
```

## Step 3: Verify Deployment

### 3.1 Check Build Logs
```bash
heroku logs --tail
```

### 3.2 Open Your App
```bash
heroku open
```

## Step 4: Environment-Specific Configuration

### 4.1 Update API URL
In your Angular environment files, update the API URL:

**src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-app-name.herokuapp.com/api/v1',
  apiTimeout: 30000,
};
```

### 4.2 Update app.json
Update the repository URL in `app.json`:
```json
{
  "repository": "https://github.com/yourusername/elisha-fit"
}
```

## Step 5: Troubleshooting

### 5.1 Common Issues

**Build Fails:**
```bash
# Check build logs
heroku logs --tail

# Common fixes:
# - Ensure all dependencies are in package.json
# - Check Node.js version compatibility
# - Verify build scripts are correct
```

**Database Connection Issues:**
```bash
# Check MongoDB connection
heroku config:get MONGODB_URI

# Test connection
heroku run node -e "console.log(process.env.MONGODB_URI)"
```

**App Crashes:**
```bash
# Check runtime logs
heroku logs --tail

# Restart the app
heroku restart
```

### 5.2 Useful Commands
```bash
# View config variables
heroku config

# Run commands on Heroku
heroku run npm run build

# Check app status
heroku ps

# Scale dynos
heroku ps:scale web=1
```

## Step 6: Production Checklist

- [ ] Environment variables set
- [ ] MongoDB Atlas configured
- [ ] API URL updated in Angular
- [ ] Production build successful
- [ ] App accessible via Heroku URL
- [ ] Database connection working
- [ ] Authentication working
- [ ] All features tested

## Step 7: Monitoring

### 7.1 Enable Logs
```bash
# Enable log drains
heroku drains:add https://your-log-service.com
```

### 7.2 Set up Monitoring
Consider using:
- Heroku Add-ons for monitoring
- MongoDB Atlas monitoring
- Application performance monitoring

## Support

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail`
2. Verify environment variables: `heroku config`
3. Test locally with production settings
4. Check MongoDB Atlas connection

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up CI/CD pipeline
4. Monitor application performance
5. Set up backups for MongoDB 
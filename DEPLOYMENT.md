# Amplizo Production Deployment Guide

## Prerequisites
- Docker & Docker Compose installed and running
- PostgreSQL database (or use Docker)
- Domain name configured (e.g., `amplizo.com`, `api.amplizo.com`)
- SSL certificate (Let's Encrypt recommended)

## Local Docker Setup
On Windows, ensure Docker Desktop is running before executing:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
docker compose up -d --build
```

## Required Environment Variables

### Backend (`.env`)
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/amplizo?schema=public"

# JWT (min 32 characters)
JWT_SECRET="your-production-jwt-secret-here"

# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://amplizo.com"

# CORS (comma-separated)
ALLOWED_ORIGINS="https://amplizo.com,https://www.amplizo.com"

# WhatsApp Webhook Verification Token (REQUIRED)
WHATSAPP_VERIFY_TOKEN="your-secure-verify-token"

# Optional: Payment (Razorpay)
PAYMENT_PROVIDER="razorpay"
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# Optional: Twilio SMS
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
SMS_MODE="production"

# Optional: SMTP Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@amplizo.com"

# Optional: Redis
REDIS_URL="redis://redis:6379"
REDIS_ENABLED="true"

# Optional: AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="amplizo-uploads"
AWS_S3_REGION="ap-south-1"
```

### Frontend (`.env.production`)
```env
NEXT_PUBLIC_API_URL="https://api.amplizo.com/api"
NEXT_PUBLIC_WS_URL="https://api.amplizo.com"
NEXT_PUBLIC_APP_URL="https://amplizo.com"
```

## Docker Deployment

### 1. Build and Start
```bash
docker compose up -d --build
```

### 2. Run Database Migrations
```bash
docker compose exec backend npx prisma migrate deploy
```

### 3. Seed Database (Optional)
```bash
docker compose exec backend npm run seed
```

### 4. Verify Deployment
```bash
# Health check
curl https://api.amplizo.com/api/health

# Expected response:
# {"status":"ok","database":"ok","timestamp":"...","service":"Amplizo Backend","version":"1.0.0"}
```

## DNS/HTTPS Requirements

### Required DNS Records

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| A | `amplizo.com` | `<server-ip>` | Frontend domain |
| A | `www.amplizo.com` | `<server-ip>` | Frontend www redirect |
| A | `api.amplizo.com` | `<server-ip>` | Backend API domain |

### SSL Certificate
- Use Let's Encrypt with Certbot
- Or use cloud provider SSL (AWS ACM, Cloudflare, etc.)
- Configure reverse proxy (Nginx/Traefik) to terminate SSL

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.amplizo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.amplizo.com;

    ssl_certificate /etc/letsencrypt/live/api.amplizo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amplizo.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Management Commands

### View Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Restart Services
```bash
docker compose restart backend
docker compose restart frontend
```

### Stop Services
```bash
docker compose down
```

### Update Deployment
```bash
git pull
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose restart backend frontend
```

### Database Backup
```bash
docker compose exec db pg_dump -U postgres amplizo > backup.sql
```

### Database Restore
```bash
docker compose exec db psql -U postgres amplizo < backup.sql
```

## Health Check

```bash
GET https://api.amplizo.com/api/health
```

Response:
```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-09-07T...",
  "service": "Amplizo Backend",
  "version": "1.0.0"
}
```

## Important Notes

1. **Do NOT expose PostgreSQL publicly** - Remove port `5432:5432` from docker-compose.yml in production
2. **Uploads directory** - Currently uses local filesystem with Docker volume. For multi-server deployments, migrate to S3.
3. **Redis** - Optional but recommended for production job queues
4. **Secrets** - Never commit `.env` files. Use Docker secrets or environment variable injection in production.
5. **Database migrations** - Always use `npx prisma migrate deploy` in production, never `prisma migrate dev`

## Troubleshooting

### Backend won't start
```bash
docker compose logs backend
# Check for missing environment variables
```

### Database connection issues
```bash
docker compose exec backend npx prisma migrate status
docker compose exec db pg_isready -U postgres
```

### Frontend can't connect to backend
```bash
# Verify NEXT_PUBLIC_API_URL is set correctly
docker compose exec frontend env | grep NEXT_PUBLIC
```

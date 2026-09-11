# Amplizo Production Deployment Checklist

## Pre-Deployment Verification (Completed)

- [x] Backend TypeScript build passes
- [x] Frontend TypeScript build passes
- [x] Backend tests pass (4/4)
- [x] Prisma schema validated
- [x] Dockerfiles production-ready
- [x] Docker Compose configuration validated
- [x] Environment variables documented
- [x] Health check endpoint implemented
- [x] CORS configuration production-ready
- [x] Security headers configured
- [x] No hardcoded secrets in code
- [x] .env files gitignored
- [x] Database migrations committed
- [x] Deployment documentation created

## Server Preparation

### 1. Server Requirements
- Ubuntu 22.04 LTS / Debian 12 / or similar Linux distribution
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- 4GB+ RAM
- 20GB+ storage
- Ports 80, 443, 3000, 4000 available

### 2. Server Setup Commands
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose (usually included with Docker)
docker compose version

# Create deployment directory
mkdir -p /opt/amplizo
cd /opt/amplizo
```

### 3. Clone Repository
```bash
git clone <your-repository-url> .
git checkout main  # or production branch
```

### 4. Configure Environment
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values
# IMPORTANT: Set DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS, WHATSAPP_VERIFY_TOKEN

# Frontend environment
cp frontend/.env.example frontend/.env.production
# Edit with production URLs
```

### 5. Deploy Application
```bash
# Build and start services
docker compose up -d --build

# Verify services are running
docker compose ps

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 6. Database Migration
```bash
# Run migrations (NEVER use migrate reset in production)
docker compose exec backend npx prisma migrate deploy

# Verify migration status
docker compose exec backend npx prisma migrate status
```

### 7. Verify Deployment
```bash
# Health check
curl https://api.amplizo.com/api/health

# Expected: {"status":"ok","database":"ok",...}

# Test public endpoint
curl https://api.amplizo.com/api/subscriptions/plans

# Test protected endpoint (should return 401)
curl https://api.amplizo.com/api/customers

# Test login
curl -X POST https://api.amplizo.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@amplizo.com","password":"your-password"}'
```

## DNS Configuration

### Required DNS Records

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `amplizo.com` | `<server-ip>` | 3600 |
| A | `www.amplizo.com` | `<server-ip>` | 3600 |
| A | `api.amplizo.com` | `<server-ip>` | 3600 |

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d amplizo.com -d www.amplizo.com -d api.amplizo.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * 1 /usr/bin/certbot renew --quiet
```

## Nginx Configuration

Create `/etc/nginx/sites-available/amplizo`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name amplizo.com www.amplizo.com api.amplizo.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl;
    server_name amplizo.com www.amplizo.com;

    ssl_certificate /etc/letsencrypt/live/amplizo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amplizo.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
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

# Backend API
server {
    listen 443 ssl;
    server_name api.amplizo.com;

    ssl_certificate /etc/letsencrypt/live/api.amplizo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amplizo.com/privkey.pem;

    client_max_body_size 50M;

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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/amplizo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Security Hardening

### 1. Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
# Do NOT allow 4000, 3000, 5432, 6379 publicly
```

### 2. Remove PostgreSQL Public Port
Edit `docker-compose.yml`:
```yaml
db:
  # REMOVE this line:
  # ports:
  #   - "5432:5432"
```

### 3. Secure Docker
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restrict Docker socket
sudo chmod 660 /var/run/docker.sock
```

## Backup Strategy

### Automated Daily Backup Script
Create `/opt/amplizo/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec db pg_dump -U postgres amplizo > /opt/amplizo/backups/backup_$DATE.sql
# Keep only last 7 days
find /opt/amplizo/backups -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/amplizo/backup.sh
```

## Rollback Procedure

```bash
# Stop services
docker compose down

# Rollback to previous image
git checkout <previous-commit>
docker compose up -d --build

# Run migrations if needed
docker compose exec backend npx prisma migrate deploy

# Verify
curl https://api.amplizo.com/api/health
```

## Monitoring

### Health Checks
- Backend: `https://api.amplizo.com/api/health`
- Frontend: `https://amplizo.com`

### Logs
```bash
# Real-time logs
docker compose logs -f backend
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Container Status
```bash
docker compose ps
```

## Environment Variables Checklist

### Backend (backend/.env)
- [ ] DATABASE_URL
- [ ] JWT_SECRET (min 32 chars)
- [ ] ALLOWED_ORIGINS
- [ ] WHATSAPP_VERIFY_TOKEN
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL
- [ ] Optional: PAYMENT_PROVIDER, RAZORPAY_*
- [ ] Optional: TWILIO_*
- [ ] Optional: SMTP_*
- [ ] Optional: REDIS_*
- [ ] Optional: AWS_*

### Frontend (frontend/.env.production)
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_WS_URL
- [ ] NEXT_PUBLIC_APP_URL

## Post-Deployment Verification

1. [ ] https://amplizo.com loads
2. [ ] https://api.amplizo.com/api/health returns 200
3. [ ] Login works
4. [ ] Dashboard loads
5. [ ] Customer list loads
6. [ ] API returns CORS headers
7. [ ] WebSocket connects
8. [ ] SSL certificate valid
9. [ ] HTTPS redirect works
10. [ ] Mobile responsive

## Emergency Contacts

- Server provider: [Document your provider]
- Domain registrar: [Document your registrar]
- SSL provider: Let's Encrypt / Certbot
- Database backup: /opt/amplizo/backups/

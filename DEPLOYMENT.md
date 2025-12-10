# Deployment Guide - HalalGuard AI

Panduan lengkap untuk deploy aplikasi HalalGuard AI ke production.

## 📋 Prasyarat Production

- Server Linux (Ubuntu 20.04+ recommended)
- PostgreSQL 12+
- Nginx (untuk reverse proxy)
- Domain name (optional, tapi recommended)
- SSL Certificate (Let's Encrypt recommended)
- Google Gemini API Key

## 🔧 Setup Server

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install Node.js (untuk build frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. Setup PostgreSQL

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE halalguard_db;
CREATE USER halalguard WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE halalguard_db TO halalguard;
\q

# Import schema
psql -U halalguard -d halalguard_db -f database/schema.sql
```

### 3. Setup Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/halalguard-ai
cd /var/www/halalguard-ai

# Setup Backend
cd backend
cp .env.example .env
nano .env  # Edit dengan credentials production
go build -o halalguard-backend main.go

# Setup Frontend
cd ../frontend
npm install
npm run build
# Build output akan ada di frontend/dist/
```

### 4. Setup Systemd Service (Backend)

Buat file `/etc/systemd/system/halalguard-backend.service`:

```ini
[Unit]
Description=HalalGuard AI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/halalguard-ai/backend
ExecStart=/var/www/halalguard-ai/backend/halalguard-backend
Restart=always
RestartSec=10

# Environment
Environment="GIN_MODE=release"

[Install]
WantedBy=multi-user.target
```

Enable dan start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable halalguard-backend
sudo systemctl start halalguard-backend
sudo systemctl status halalguard-backend
```

### 5. Setup Nginx

Buat file `/etc/nginx/sites-available/halalguard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda

    # Frontend (Static Files)
    root /var/www/halalguard-ai/frontend/dist;
    index index.html;

    # Frontend Routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8087/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/halalguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Dapatkan SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal sudah disetup otomatis
# Test renewal:
sudo certbot renew --dry-run
```

## 🔒 Security Checklist

- [ ] Gunakan password database yang kuat
- [ ] Simpan `.env` dengan permissions 600
- [ ] Enable firewall (UFW)
- [ ] Setup fail2ban untuk brute force protection
- [ ] Regular backup database
- [ ] Monitor logs secara berkala
- [ ] Update dependencies secara berkala

### Setup Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Monitoring & Logs

### Backend Logs
```bash
sudo journalctl -u halalguard-backend -f
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🔄 Update Application

```bash
cd /var/www/halalguard-ai

# Pull latest changes
git pull

# Update Backend
cd backend
go build -o halalguard-backend main.go
sudo systemctl restart halalguard-backend

# Update Frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

## 💾 Database Backup

### Manual Backup
```bash
pg_dump -U halalguard halalguard_db > backup_$(date +%Y%m%d).sql
```

### Automated Backup (Cron)

Buat script `/usr/local/bin/backup-halalguard.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/halalguard"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -U halalguard halalguard_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Tambahkan ke crontab:
```bash
sudo chmod +x /usr/local/bin/backup-halalguard.sh
sudo crontab -e

# Add this line (backup every day at 2 AM)
0 2 * * * /usr/local/bin/backup-halalguard.sh
```

## 🚨 Troubleshooting Production

### Backend tidak start
```bash
# Check logs
sudo journalctl -u halalguard-backend -n 50

# Check if port 8087 is in use
sudo netstat -tulpn | grep 8087

# Check .env file
cat /var/www/halalguard-ai/backend/.env
```

### Database connection error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U halalguard -d halalguard_db -h localhost
```

### Nginx error
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## 📈 Performance Optimization

### PostgreSQL Tuning
Edit `/etc/postgresql/*/main/postgresql.conf`:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Nginx Caching
Tambahkan di nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🎯 Production Environment Variables

### Backend (.env)
```env
PORT=8087
GEMINI_API_KEY=your_production_api_key
DB_HOST=localhost
DB_PORT=5432
DB_USER=halalguard
DB_PASSWORD=your_secure_password
DB_NAME=halalguard_db
DB_SSLMODE=require
CORS_ORIGIN=https://your-domain.com
GIN_MODE=release
```

### Frontend (.env)
```env
VITE_API_URL=https://your-domain.com/api
```

---

**Note**: Ganti `your-domain.com` dengan domain Anda yang sebenarnya, dan `your_secure_password` dengan password yang kuat.

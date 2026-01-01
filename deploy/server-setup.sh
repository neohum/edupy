#!/bin/bash
# Server setup script for AWS Lightsail Ubuntu 22.04
# Run this script on the server after initial SSH connection

set -e

echo "=========================================="
echo "  EduPy Server Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_warning "This script requires sudo privileges"
    exec sudo "$0" "$@"
fi

# Update system
echo ""
echo "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"

# Install required packages
echo ""
echo "Step 2: Installing required packages..."
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw
print_status "Required packages installed"

# Install Docker
echo ""
echo "Step 3: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Add ubuntu user to docker group
usermod -aG docker ubuntu
print_status "Added ubuntu user to docker group"

# Create application directory
echo ""
echo "Step 4: Creating application directory..."
mkdir -p /app/edupy
chown -R ubuntu:ubuntu /app
print_status "Application directory created at /app/edupy"

# Configure firewall
echo ""
echo "Step 5: Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
print_status "Firewall configured"

# Configure Nginx
echo ""
echo "Step 6: Configuring Nginx..."
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create initial nginx config (HTTP only, for certbot)
cat > /etc/nginx/sites-available/edupy << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
EOF

ln -sf /etc/nginx/sites-available/edupy /etc/nginx/sites-enabled/
mkdir -p /var/www/certbot
nginx -t && systemctl reload nginx
print_status "Nginx configured"

# Create data directory for backend
mkdir -p /app/edupy/data
chown -R ubuntu:ubuntu /app/edupy/data
print_status "Data directory created"

# Setup complete
echo ""
echo "=========================================="
echo -e "${GREEN}  Server setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure GitHub Secrets in your repository"
echo "2. Push code to main branch to trigger deployment"
echo "3. After deployment, configure SSL with:"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "Server Information:"
echo "  - Application directory: /app/edupy"
echo "  - Nginx config: /etc/nginx/sites-available/edupy"
echo "  - Docker status: $(systemctl is-active docker)"
echo ""
print_warning "Remember to log out and log back in for docker group to take effect"

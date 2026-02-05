#!/bin/bash

# Handwerker PWA Installationsskript für Proxmox LXC (Debian 12)
# Autor: Handwerker PWA Team
# Version: 1.0
# Datum: $(date +%Y-%m-%d)

# Farbliche Ausgabe für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging Funktion
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] FEHLER: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNUNG: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Überprüfen, ob das Skript als Root ausgeführt wird
if [[ $EUID -ne 0 ]]; then
   error "Dieses Skript muss als Root ausgeführt werden!"
fi

# System-Informationen anzeigen
log "Handwerker PWA Installation gestartet"
info "System: $(uname -a)"
info "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
info "IP-Adresse: $(hostname -I | awk '{print $1}')"

# Variablen definieren
APP_NAME="handwerker-pwa"
APP_DIR="/var/www/$APP_NAME"
APP_USER="www-data"
APP_GROUP="www-data"
NODE_VERSION="20"
PORT="3000"
DOMAIN="localhost"
EMAIL="admin@localhost"

# Funktion zum Prüfen des Befehlsstatus
check_status() {
    if [ $? -eq 0 ]; then
        log "$1 erfolgreich"
    else
        error "$1 fehlgeschlagen"
    fi
}

# 1. System-Update
log "Schritt 1: System-Update durchführen..."
apt update && apt upgrade -y
check_status "System-Update"

# 2. Grundlegende Abhängigkeiten installieren
log "Schritt 2: Grundlegende Abhängigkeiten installieren..."
apt install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    build-essential \
    git \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    sqlite3 \
    pm2
check_status "Grundlegende Abhängigkeiten"

# 3. Node.js LTS installieren
log "Schritt 3: Node.js $NODE_VERSION LTS installieren..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
check_status "Node.js Repository hinzufügen"

apt-get install -y nodejs
check_status "Node.js Installation"

# Node.js Version überprüfen
NODE_VER=$(node --version)
info "Installierte Node.js Version: $NODE_VER"
NPM_VER=$(npm --version)
info "Installierte NPM Version: $NPM_VER"

# 4. MongoDB installieren (Alternative zu Firebase)
log "Schritt 4: MongoDB installieren..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt update
apt install -y mongodb-org
check_status "MongoDB Installation"

# MongoDB Service starten und aktivieren
systemctl start mongod
systemctl enable mongod
check_status "MongoDB Service"

# MongoDB Konfiguration für lokale Nutzung
info "MongoDB für lokale Nutzung konfigurieren..."
sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
systemctl restart mongod

# 5. App-Verzeichnis erstellen und Berechtigungen setzen
log "Schritt 5: App-Verzeichnis erstellen..."
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_GROUP $APP_DIR
chmod -R 755 $APP_DIR
check_status "App-Verzeichnis erstellt"

# 6. Git Repository klonen (Platzhalter - in echter Umgebung ersetzen)
log "Schritt 6: Anwendung部署..."
# Hinweis: In echter Umgebung hier das Git Repository klonen
# git clone https://github.com/your-repo/handwerker-pwa.git $APP_DIR

# Für Demo-Zwecke: Erstellen einer einfachen package.json wenn nicht vorhanden
if [ ! -f "$APP_DIR/package.json" ]; then
    info "Erstelle Demo package.json..."
    cat > $APP_DIR/package.json << 'EOF'
{
  "name": "handwerker-pwa",
  "version": "1.0.0",
  "description": "Progressive Web App für Handwerker",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "serve": "serve -s build -l 3000"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongoose": "^7.5.0",
    "serve": "^14.2.1"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
EOF
fi

# 7. NPM-Abhängigkeiten installieren
log "Schritt 7: NPM-Abhängigkeiten installieren..."
cd $APP_DIR
npm install
check_status "NPM-Installation"

# 8. Einfachen Express-Server erstellen (falls nicht vorhanden)
if [ ! -f "$APP_DIR/server.js" ]; then
    info "Erstelle Express-Server..."
    cat > $APP_DIR/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Statische Dateien aus dem Build-Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'build')));

// MongoDB Verbindung
mongoose.connect('mongodb://localhost:27017/handwerker-pwa', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB verbunden');
}).catch(err => {
    console.error('MongoDB Verbindungsfehler:', err);
});

// API-Routen
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Alle anderen Anfragen an die React-App weiterleiten
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
EOF
fi

# 9. Frontend Build-Prozess
log "Schritt 9: Frontend Build-Prozess..."
if [ -f "$APP_DIR/package.json" ] && grep -q '"build"' "$APP_DIR/package.json"; then
    npm run build
    check_status "Frontend Build"
else
    warning "Build-Skript nicht gefunden, überspringe Build-Prozess"
fi

# 10. Berechtigungen setzen
log "Schritt 10: Berechtigungen setzen..."
chown -R $APP_USER:$APP_GROUP $APP_DIR
find $APP_DIR -type d -exec chmod 755 {} \;
find $APP_DIR -type f -exec chmod 644 {} \;
check_status "Berechtigungen gesetzt"

# 11. PM2 Konfiguration erstellen
log "Schritt 11: PM2 Konfiguration erstellen..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '/var/log/$APP_NAME-error.log',
    out_file: '/var/log/$APP_NAME-out.log',
    log_file: '/var/log/$APP_NAME-combined.log',
    time: true
  }]
};
EOF

# PM2 App starten
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup
check_status "PM2 Konfiguration"

# 12. Nginx Konfiguration
log "Schritt 12: Nginx Konfiguration erstellen..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # PWA Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # PWA Caching Headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # Service Worker
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # Manifest
    location = /manifest.json {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Proxy zu Node.js App
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout Einstellungen
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Site aktivieren
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx Konfiguration testen und neu starten
nginx -t
check_status "Nginx Konfigurationstest"

systemctl restart nginx
systemctl enable nginx
check_status "Nginx Neustart"

# 13. Firewall konfigurieren
log "Schritt 13: Firewall konfigurieren..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
check_status "Firewall Konfiguration"

# 14. Log-Verzeichnisse erstellen
log "Schritt 14: Log-Verzeichnisse erstellen..."
mkdir -p /var/log/$APP_NAME
touch /var/log/$APP_NAME-error.log
touch /var/log/$APP_NAME-out.log
touch /var/log/$APP_NAME-combined.log
chown -R $APP_USER:$APP_GROUP /var/log/$APP_NAME
check_status "Log-Verzeichnisse"

# 15. Systemd Service für automatische Updates (optional)
log "Schritt 15: Auto-Update Service erstellen..."
cat > /etc/systemd/system/handwerker-pwa-update.service << EOF
[Unit]
Description=Handwerker PWA Auto Update
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm update
ExecStart=/usr/bin/pm2 restart $APP_NAME

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/handwerker-pwa-update.timer << EOF
[Unit]
Description=Run Handwerker PWA update weekly
Requires=handwerker-pwa-update.service

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl enable handwerker-pwa-update.timer
systemctl start handwerker-pwa-update.timer

# 16. Abschluss-Informationen
log "Installation abgeschlossen!"

echo ""
echo "============================================"
echo "🎉 Handwerker PWA Installation erfolgreich!"
echo "============================================"
echo ""
echo "📱 App-URL: http://$DOMAIN"
echo "🔧 Admin-Panel: http://$DOMAIN:3000" 
echo "📊 PM2 Status: pm2 status"
echo "📝 Logs: tail -f /var/log/$APP_NAME-combined.log"
echo ""
echo "🔐 MongoDB Status:"
systemctl is-active mongod
echo ""
echo "🌐 Nginx Status:"
systemctl is-active nginx
echo ""
echo "⚡ PM2 Status:"
pm2 status
echo ""
echo "📋 Nützliche Befehle:"
echo "  - App neustarten: pm2 restart $APP_NAME"
echo "  - App stoppen: pm2 stop $APP_NAME"
echo "  - Logs ansehen: pm2 logs $APP_NAME"
echo "  - Nginx neu starten: systemctl restart nginx"
echo "  - MongoDB Status: systemctl status mongod"
echo ""
echo "🔥 Firewall Status:"
ufw status
echo ""
echo "📁 Installationsverzeichnis: $APP_DIR"
echo "👤 App läuft als Benutzer: $APP_USER"
echo "🌐 Port: $PORT"
echo ""
echo "⚠️  WICHTIGE NÄCHSTE SCHRITTE:"
echo "1. Konfigurieren Sie die Domain in /etc/nginx/sites-available/$APP_NAME"
echo "2. Richten Sie SSL mit Let's Encrypt ein: certbot --nginx -d $DOMAIN"
echo "3. Passen Sie die MongoDB-Konfiguration bei Bedarf an"
echo "4. Erstellen Sie Backup-Strategien für die Datenbank"
echo ""
echo "============================================"

# System-Informationen am Ende
info "System-Status nach Installation:"
info "Speichernutzung: $(df -h / | tail -1 | awk '{print $5}')"
info "RAM-Nutzung: $(free -h | grep Mem | awk '{print $3"/"$2}')"
info "CPU-Auslastung: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"

log "Installationsskript beendet. Die App ist jetzt einsatzbereit!"

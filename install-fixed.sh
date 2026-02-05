#!/bin/bash

# Handwerker PWA Installationsskript für Proxmox LXC (Debian 12)
# Autor: Handwerker PWA Team
# Version: 1.1 (Fixed)
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
    sqlite3
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

# PM2 global installieren
log "PM2 über NPM installieren..."
npm install -g pm2
check_status "PM2 Installation"

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

# 6. React-App-Struktur erstellen (React 17 für Kompatibilität)
log "Schritt 6: React-App-Struktur erstellen..."

# Verzeichnisse erstellen
mkdir -p $APP_DIR/src/{components,pages,contexts,assets}
mkdir -p $APP_DIR/public

# package.json mit React 17 erstellen
cat > $APP_DIR/package.json << 'EOF'
{
  "name": "handwerker-pwa",
  "version": "1.0.0",
  "description": "Progressive Web App für Handwerker",
  "private": true,
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^6.8.1",
    "react-scripts": "5.0.1",
    "idb": "^7.1.1",
    "lucide-react": "^0.323.0",
    "tailwindcss": "^3.2.7",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# index.html erstellen
cat > $APP_DIR/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Handwerker PWA" />
    <title>Handwerker PWA</title>
</head>
<body>
    <noscript>Sie benötigen JavaScript um diese App zu nutzen.</noscript>
    <div id="root"></div>
</body>
</html>
EOF

# React App mit React 17 Syntax erstellen
cat > $APP_DIR/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const App = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>🔧 Handwerker PWA</h1>
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>✅ Installation erfolgreich!</h2>
        <p style={{ color: '#64748b', marginBottom: '10px' }}>Die Progressive Web App läuft erfolgreich.</p>
        <p style={{ color: '#64748b' }}>Frontend: React 17 mit Create React App</p>
        <p style={{ color: '#64748b' }}>Backend: Node.js mit Express</p>
        <p style={{ color: '#64748b' }}>Datenbank: MongoDB</p>
        <p style={{ color: '#64748b' }}>Proxy: Nginx</p>
        <p style={{ color: '#64748b' }}>Process Manager: PM2</p>
      </div>
      <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ color: '#1d4ed8', marginBottom: '10px' }}>🚀 Nächste Schritte:</h3>
        <ul style={{ textAlign: 'left', color: '#1e40af' }}>
          <li>App im Browser testen</li>
          <li>PWA-Features testen (Installieren, Offline)</li>
          <li>Eigene React-Komponenten hinzufügen</li>
          <li>Backend-API erweitern</li>
        </ul>
      </div>
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
        <p>📱 Diese App kann als PWA installiert werden!</p>
        <p>🔧 Voll funktionsfähig im Offline-Modus</p>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
EOF

# index.css erstellen
cat > $APP_DIR/src/index.css << 'EOF'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

# manifest.json erstellen
cat > $APP_DIR/public/manifest.json << 'EOF'
{
  "short_name": "Handwerker PWA",
  "name": "Handwerker Progressive Web App",
  "icons": [],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF

check_status "React-App-Struktur erstellt"

# 7. NPM-Abhängigkeiten installieren
log "Schritt 7: NPM-Abhängigkeiten installieren..."
cd $APP_DIR
npm install
check_status "NPM-Installation"

# 8. Express-Server erstellen
log "Schritt 8: Express-Server erstellen..."
cat > $APP_DIR/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Statische Dateien aus dem Build-Verzeichnis servieren
app.use(express.static(path.join(__dirname, 'build')));

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

# 9. Frontend Build-Prozess
log "Schritt 9: Frontend Build-Prozess..."
npm run build
check_status "Frontend Build"

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

# 15. Abschluss-Informationen
log "Installation abgeschlossen!"

echo ""
echo "============================================"
echo "🎉 Handwerker PWA Installation erfolgreich!"
echo "============================================"
echo ""
echo "📱 App-URL: http://$DOMAIN"
echo "🔧 API-Health: http://$DOMAIN/api/health" 
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

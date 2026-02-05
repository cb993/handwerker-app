# Deployment Anleitung für Proxmox LXC Container

## 🚀 Schnellstart

### 1. Proxmox LXC Container erstellen

1. **Neuen Container erstellen:**
   - Template: Debian 12 Standard
   - CPU: 2 Kerne (minimum)
   - RAM: 2GB (minimum)
   - Speicher: 20GB (minimum)
   - Netzwerk: Bridge mit DHCP oder statische IP

2. **Container starten und SSH-Zugriff einrichten:**
   ```bash
   # Im Proxmox Web-Interface oder CLI
   pct start <container-id>
   pct enter <container-id>
   ```

### 2. Installationsskript ausführen

```bash
# 1. SSH in den Container
ssh root@<container-ip>

# 2. Skript herunterladen (falls nicht bereits vorhanden)
wget https://raw.githubusercontent.com/your-repo/handwerker-pwa/main/install.sh

# 3. Skript ausführbar machen
chmod +x install.sh

# 4. Installation starten
./install.sh
```

### 3. Nach der Installation

Die App ist unter `http://<container-ip>` erreichbar.

## 📋 Detaillierte Schritte

### Voraussetzungen

- Proxmox VE 7.x oder höher
- Debian 12 LXC Template
- Root-Zugriff auf den Container
- Internetverbindung

### Installationsskript-Details

Das Installationsskript führt folgende Schritte automatisch durch:

1. **System-Update**: `apt update && apt upgrade -y`
2. **Abhängigkeiten installieren**:
   - Node.js 20 LTS
   - NPM
   - Nginx
   - MongoDB
   - PM2
   - UFW Firewall
3. **Anwendung部署**:
   - Git Repository klonen (Platzhalter)
   - NPM-Abhängigkeiten installieren
   - Frontend build
4. **Konfiguration**:
   - Nginx Reverse Proxy
   - PM2 Prozess-Management
   - Firewall-Regeln
   - Logging

### Manuelles Anpassen

#### Domain konfigurieren

Editieren Sie die Nginx-Konfiguration:
```bash
nano /etc/nginx/sites-available/handwerker-pwa
```

Domain anpassen:
```nginx
server_name ihre-domain.de www.ihre-domain.de;
```

Nginx neu starten:
```bash
nginx -t
systemctl restart nginx
```

#### SSL mit Let's Encrypt

```bash
# SSL-Zertifikat erstellen
certbot --nginx -d ihre-domain.de -d www.ihre-domain.de

# Auto-Renewal einrichten
crontab -e
# Folgende Zeile hinzufügen:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### MongoDB Konfiguration

Für Produktionsumgebungen:
```bash
# MongoDB Konfiguration bearbeiten
nano /etc/mongod.conf

# Sicherheit aktivieren
security:
  authorization: enabled

# Benutzer erstellen
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "sicheres-passwort",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})
```

## 🔧 Wartung und Management

### PM2 Befehle

```bash
# App-Status prüfen
pm2 status

# Logs ansehen
pm2 logs handwerker-pwa

# App neustarten
pm2 restart handwerker-pwa

# App stoppen
pm2 stop handwerker-pwa

# PM2 Liste beim Neustart laden
pm2 startup
pm2 save
```

### Nginx Management

```bash
# Konfiguration testen
nginx -t

# Nginx neu starten
systemctl restart nginx

# Nginx Status
systemctl status nginx

# Logs ansehen
tail -f /var/log/nginx/error.log
```

### MongoDB Management

```bash
# Status prüfen
systemctl status mongod

# MongoDB neu starten
systemctl restart mongod

# Logs ansehen
tail -f /var/log/mongodb/mongod.log

# Datenbank-Backup erstellen
mongodump --db handwerker-pwa --out /backup/$(date +%Y%m%d)
```

### Firewall Management

```bash
# Firewall-Status
ufw status

# Port öffnen
ufw allow 8080

# Firewall neu laden
ufw reload
```

## 📊 Monitoring

### System-Überwachung

```bash
# System-Ressourcen
htop
df -h
free -h

# Netzwerk-Verbindungen
netstat -tulpn

# Prozesse
ps aux | grep node
```

### Log-Dateien

Wichtige Log-Dateien:
- App-Logs: `/var/log/handwerker-pwa-*.log`
- Nginx-Logs: `/var/log/nginx/`
- MongoDB-Logs: `/var/log/mongodb/`
- System-Logs: `/var/log/syslog`

## 🔄 Updates

### App-Update

```bash
# In das App-Verzeichnis wechseln
cd /var/www/handwerker-pwa

# Git pull (falls Repository)
git pull origin main

# Abhängigkeiten aktualisieren
npm update

# Neu builden
npm run build

# PM2 neustarten
pm2 restart handwerker-pwa
```

### System-Update

```bash
# System-Update
apt update && apt upgrade -y

# Node.js Update
nvm install --lts
nvm use --lts

# MongoDB Update
apt update
apt install --only-upgrade mongodb-org
```

## 🚨 Fehlerbehebung

### Häufige Probleme

1. **App startet nicht:**
   ```bash
   # PM2 Logs prüfen
   pm2 logs handwerker-pwa
   
   # Port prüfen
   netstat -tulpn | grep :3000
   ```

2. **Nginx 502 Bad Gateway:**
   ```bash
   # Nginx-Konfiguration prüfen
   nginx -t
   
   # Backend-Status prüfen
   curl http://localhost:3000/api/health
   ```

3. **MongoDB Verbindungsfehler:**
   ```bash
   # MongoDB Status prüfen
   systemctl status mongod
   
   # Verbindung testen
   mongo --eval "db.adminCommand('ismaster')"
   ```

4. **Speicherplatz voll:**
   ```bash
   # Speicher prüfen
   df -h
   
   # Logs aufräumen
   > /var/log/handwerker-pwa-combined.log
   ```

### Backup & Recovery

```bash
# Vollständiges Backup erstellen
tar -czf /backup/handwerker-pwa-$(date +%Y%m%d).tar.gz /var/www/handwerker-pwa

# MongoDB Backup
mongodump --db handwerker-pwa --out /backup/mongodb-$(date +%Y%m%d)

# Wiederherstellung
tar -xzf /backup/handwerker-pwa-YYYYMMDD.tar.gz -C /
mongorestore /backup/mongodb-YYYYMMDD/handwerker-pwa
```

## 🔒 Sicherheit

### Sicherheits-Checkliste

- [ ] Firewall aktiviert (UFW)
- [ ] SSL-Zertifikat installiert
- [ ] MongoDB mit Authentifizierung
- [ ] Regelmäßige Updates
- [ ] Backup-Strategie
- [ ] Log-Monitoring
- [ ] Fail2Ban installiert (optional)

### Fail2Ban Installation

```bash
apt install fail2ban -y

# Konfiguration erstellen
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

## 📞 Support

Bei Problemen:
1. Logs prüfen
2. System-Status überprüfen
3. Firewall-Einstellungen kontrollieren
4. Netzwerkverbindung testen

Für weitere Unterstützung: GitHub Issues oder Dokumentation konsultieren.

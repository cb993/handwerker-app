# 🚀 Schnellinstallationsanleitung für Proxmox LXC

## ⚡ 5-Minuten Installation

### 1. Proxmox LXC Container vorbereiten

```bash
# Im Proxmox Web-Interface oder CLI:
pct create 100 local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst \
  --hostname handwerker-pwa \
  --memory 2048 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0 \
  --storage local-lvm \
  --rootfs local-lvm:8 \
  --unprivileged 1

# Container starten
pct start 100

# In Container einloggen
pct enter 100
```

### 2. Installationsskript ausführen

```bash
# 1. System aktualisieren (optional, wird vom Skript erledigt)
apt update && apt upgrade -y

# 2. Skript herunterladen und ausführen
curl -fsSL https://raw.githubusercontent.com/your-repo/handwerker-pwa/main/install.sh -o install.sh
chmod +x install.sh
./install.sh
```

### 3. Fertig! 🎉

Die App ist jetzt unter `http://<container-ip>` erreichbar.

---

## 📋 Detaillierte Schritte mit Erklärungen

### Schritt 1: Container erstellen und konfigurieren

```bash
# 1a: Container erstellen (falls noch nicht geschehen)
pct create 101 local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst \
  --hostname handwerker-pwa \
  --memory 2048 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage local-lvm \
  --rootfs local-lvm:8 \
  --unprivileged 1

# 1b: Container starten
pct start 101

# 1c: In Container einloggen
pct enter 101
```

### Schritt 2: Installation durchführen

```bash
# 2a: Sicherstellen, dass wir als Root sind
sudo su

# 2b: Installationsskript herunterladen
wget https://raw.githubusercontent.com/your-repo/handwerker-pwa/main/install.sh

# 2c: Skript ausführbar machen
chmod +x install.sh

# 2d: Installation starten (dauert ca. 10-15 Minuten)
./install.sh
```

### Schritt 3: Überprüfung

```bash
# 3a: PM2 Status prüfen
pm2 status

# 3b: Nginx Status prüfen
systemctl status nginx

# 3c: MongoDB Status prüfen
systemctl status mongod

# 3d: App-Test
curl http://localhost/api/health
```

---

## 🔧 Nach der Installation

### IP-Adresse finden
```bash
ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1
```

### App im Browser aufrufen
```
http://<gefundene-ip-adresse>
```

### Demo-Zugangsdaten
- E-Mail: `demo@handwerker.de`
- Passwort: `demo123`

---

## 🛠️ Wichtige Befehle nach der Installation

### App Management
```bash
# App neustarten
pm2 restart handwerker-pwa

# App stoppen
pm2 stop handwerker-pwa

# App-Logs ansehen
pm2 logs handwerker-pwa

# PM2 Status
pm2 status
```

### System Management
```bash
# Nginx neu starten
systemctl restart nginx

# MongoDB neu starten
systemctl restart mongod

# Firewall-Status
ufw status

# System-Ressourcen
htop
df -h
free -h
```

### Logs ansehen
```bash
# App-Logs
tail -f /var/log/handwerker-pwa-combined.log

# Nginx-Logs
tail -f /var/log/nginx/error.log

# MongoDB-Logs
tail -f /var/log/mongodb/mongod.log
```

---

## 🚨 Häufige Probleme und Lösungen

### Problem: App nicht erreichbar
```bash
# Lösung: Services prüfen
systemctl status nginx
systemctl status mongod
pm2 status

# Ports prüfen
netstat -tulpn | grep -E ':(80|3000|27017)'
```

### Problem: Installation schlägt fehl
```bash
# Lösung: Manuelle Installation
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx mongodb-org pm2
```

### Problem: Speicherplatz voll
```bash
# Lösung: Logs aufräumen
> /var/log/handwerker-pwa-combined.log
> /var/log/nginx/error.log
df -h
```

---

## 📱 App als PWA installieren

1. App im Browser öffnen
2. "Installieren" Button klicken (erscheint nach einigen Sekunden)
3. App auf Homescreen hinzufügen

---

## 🔒 SSL-Zertifikat einrichten (optional)

```bash
# Domain in Nginx-Konfiguration eintragen
nano /etc/nginx/sites-available/handwerker-pwa

# SSL installieren
certbot --nginx -d ihre-domain.de

# Auto-Renewal einrichten
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

---

## 📞 Support

Bei Problemen:
1. Logs prüfen: `pm2 logs handwerker-pwa`
2. Services prüfen: `systemctl status nginx mongod`
3. Netzwerk prüfen: `curl http://localhost/api/health`
4. Container neustarten: `pct reboot 101`

**Fertig! Ihre Handwerker PWA ist jetzt einsatzbereit! 🎉**

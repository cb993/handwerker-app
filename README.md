# Handwerker PWA

Eine Progressive Web App für Handwerker zur Baustellendokumentation und Kommunikation, die die Kernfunktionen von Craftnote nachbildet.

## 🚀 Features

### 📱 PWA-Funktionen
- **Offline First**: Vollständige Nutzung ohne Internetverbindung
- **Installierbar**: Kann auf dem Homescreen installiert werden (Add to Home Screen)
- **Responsive Design**: Optimiert für Smartphones, Tablets und Desktop
- **Schnelle Ladezeiten**: Performance-optimiert mit Service Worker

### 🏗️ Kernfunktionen

#### Projektverwaltung
- Liste aller aktiven und abgeschlossenen Projekte
- Schnelle Übersicht über den Projektstatus
- Neue Projekte anlegen (Name, Adresse, Start-/Enddatum, Kunde)
- Projekt-Detailansicht mit allen Informationen

#### Bautagebuch
- Tägliche Einträge mit Datum und Wetter
- Textnotizen und Fotodokumentation
- Mehrere Fotos pro Eintrag mit Zeitstempel
- Offline-Aufnahme und spätere Synchronisation

#### Digitale Formulare / Rapporte
- Vordefinierte Formularvorlagen (Tagesbericht, Wochenbericht, Mängelbericht, etc.)
- Felder für Datum, Mitarbeiter, Arbeitsstunden, Tätigkeiten, Materialliste
- Digitale Unterschrift (Platzhalter für zukünftige Implementierung)
- PDF-Export der ausgefüllten Formulare

#### Zeiterfassung
- Stempeluhr-Funktion (Start/Pause/Stopp) pro Mitarbeiter und Projekt
- Manuelle Nachbearbeitung von Zeiten
- Übersicht der geleisteten Stunden
- CSV-Export der Zeiterfassungsdaten

#### Mitarbeiterverwaltung
- Anlegen und Verwalten von Mitarbeitern
- Zuweisung zu Projekten
- Kontaktdaten und Fähigkeiten

#### Datenexport
- Export von Bautagebuch-Einträgen als PDF
- Export von Regieberichten als PDF
- Export von Zeiterfassungsdaten als CSV

## 🛠️ Technologien

### Frontend
- **React 18** - UI-Framework
- **React Router** - Client-seitiges Routing
- **Tailwind CSS** - Utility-First CSS Framework
- **Lucide React** - Icon-Bibliothek

### PWA-Features
- **Service Worker** - Offline-Funktionalität und Caching
- **Web App Manifest** - Installierbarkeit und App-Identität
- **IndexedDB** - Lokale Datenspeicherung
- **Workbox** - Service Worker Bibliothek

### Zusätzliche Bibliotheken
- **idb** - Einfache IndexedDB Wrapper
- **react-signature-canvas** - Digitale Unterschriften
- **jspdf** - PDF-Generierung
- **html2canvas** - Screenshot-Funktionalität
- **date-fns** - Datum-Manipulation
- **react-dropzone** - Datei-Upload

## 📦 Installation

### Voraussetzungen
- Node.js (Version 16 oder höher)
- npm oder yarn

### Schritte

1. **Repository klonen**
```bash
git clone <repository-url>
cd handwerker-app-craftnote
```

2. **Abhängigkeiten installieren**
```bash
npm install
```

3. **Entwicklungsserver starten**
```bash
npm start
```

Die App wird unter `http://localhost:3000` verfügbar sein.

4. **Produktions-Build erstellen**
```bash
npm run build
```

## 🏗️ Projektstruktur

```
handwerker-app-craftnote/
├── public/
│   ├── index.html          # Haupt-HTML-Datei mit PWA-Metadaten
│   ├── manifest.json       # Web App Manifest
│   └── service-worker.js   # Service Worker für Offline-Funktionalität
├── src/
│   ├── components/         # Wiederverwendbare React-Komponenten
│   │   └── Layout/         # Layout-Komponenten
│   ├── contexts/           # React Contexts (Auth, Offline)
│   ├── pages/              # Seiten-Komponenten
│   │   ├── Auth/           # Anmeldeseite
│   │   ├── Dashboard/      # Dashboard
│   │   ├── Projects/       # Projektverwaltung
│   │   ├── ConstructionDiary/ # Bautagebuch
│   │   ├── TimeTracking/   # Zeiterfassung
│   │   ├── Employees/      # Mitarbeiterverwaltung
│   │   ├── Forms/          # Digitale Formulare
│   │   └── Profile/        # Profilseite
│   ├── App.js              # Haupt-App-Komponente
│   ├── index.js            # Entry Point
│   └── index.css           # Globale Styles
├── package.json            # Projekt-Abhängigkeiten
├── tailwind.config.js      # Tailwind CSS Konfiguration
└── README.md              # Diese Datei
```

## 🔧 Konfiguration

### PWA-Einstellungen
Die PWA-Konfiguration befindet sich in:
- `public/manifest.json` - App-Metadaten und Icons
- `public/service-worker.js` - Caching-Strategien und Offline-Funktionalität

### Datenbank
Die App verwendet IndexedDB für die lokale Datenspeicherung. Die Datenbankstruktur wird in `src/contexts/OfflineContext.js` definiert.

### Styling
Tailwind CSS wird für das Styling verwendet. Die Konfiguration befindet sich in `tailwind.config.js`.

## 📱 Nutzung

### Anmeldung
Verwenden Sie die Demo-Anmeldedaten:
- E-Mail: `demo@handwerker.de`
- Passwort: `demo123`

### Offline-Nutzung
1. Laden Sie die App einmal online, um alle Assets zu cachen
2. Die App funktioniert anschließend auch ohne Internetverbindung
3. Änderungen werden automatisch synchronisiert, wenn die Verbindung wiederhergestellt ist

### Installation auf dem Gerät
1. Öffnen Sie die App in einem kompatiblen Browser
2. Klicken Sie auf "Installieren" (erscheint nach einiger Zeit automatisch)
3. Die App wird auf Ihrem Homescreen installiert

## 🔄 Daten-Synchronisation

Die App implementiert eine Offline-First-Architektur:

1. **Lokale Speicherung**: Alle Daten werden zuerst in IndexedDB gespeichert
2. **Sync-Queue**: Änderungen werden in einer Warteschlange gespeichert
3. **Automatische Synchronisation**: Bei Online-Verbindung werden Daten synchronisiert
4. **Konfliktlösung**: Bei Konflikten wird der lokale Zustand bevorzugt

## 🚀 Deployment

### Firebase Hosting (empfohlen)
```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Projekt initialisieren
firebase init hosting

# Deployen
firebase deploy
```

### Andere Hosting-Optionen
Die App kann auf jedem statischen Hosting-Service deployed werden:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Mitwirken

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie zum Branch (`git push origin feature/AmazingFeature`)
5. Erstellen Sie einen Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz - siehe die `LICENSE`-Datei für Details.

## 🔮 Zukünftige Features

- [ ] Echte digitale Unterschrift-Funktionalität
- [ ] Push-Benachrichtigungen
- [ ] Backend-Integration mit Firebase
- [ ] Mehrsprachige Unterstützung
- [ ] Erweiterte Berichte und Statistiken
- [ ] Integration mit Kalender-Apps
- [ ] Geolocation-basierte Wetterdaten
- [ ] Chat-Funktionalität in Projekten

## 📞 Support

Bei Fragen oder Problemen:
- Erstellen Sie ein Issue im GitHub-Repository
- Kontaktieren Sie das Entwicklungsteam

---

**Handwerker PWA** - Moderne Baustellendokumentation für Handwerker

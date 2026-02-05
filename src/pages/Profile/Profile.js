import React, { useState } from 'react';
import { useAuth } from '../../contexts/OfflineContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  Camera,
  Shield,
  Bell,
  Smartphone,
  Download,
  Trash2
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, isOnline } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: user?.company || '',
    role: '',
    bio: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      alert('Profil erfolgreich aktualisiert!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Fehler beim Aktualisieren des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Export user data as JSON
    const dataStr = JSON.stringify({ user, profile: formData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Möchten Sie wirklich alle lokalen Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      // Clear IndexedDB
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear localStorage
      localStorage.clear();
      
      alert('Lokale Daten wurden gelöscht. Die Seite wird neu geladen.');
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Benachrichtigungen', icon: Bell },
    { id: 'security', name: 'Sicherheit', icon: Shield },
    { id: 'app', name: 'App', icon: Smartphone }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600">Verwalten Sie Ihre persönlichen Informationen und Einstellungen</p>
        </div>
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="loading-spinner w-4 h-4 text-yellow-600 mr-2"></div>
            <span className="text-yellow-800">
              Sie sind offline. Änderungen werden später synchronisiert.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Persönliche Informationen</h3>
                </div>
                <form onSubmit={handleSubmit} className="card-body space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                      {formData.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => alert('Profilbild-Upload würde hier implementiert werden')}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Foto ändern
                      </button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG oder GIF. Max 2MB</p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="Max Mustermann"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">E-Mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="max@firma.de"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Telefon</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="+49 123 456789"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="company" className="form-label">Firma</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="form-input pl-10"
                          placeholder="Musterfirma GmbH"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Adresse</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label htmlFor="street" className="form-label">Straße</label>
                        <input
                          type="text"
                          id="street"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Hauptstraße 123"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="postalCode" className="form-label">PLZ</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="12345"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="city" className="form-label">Stadt</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Berlin"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="form-group">
                    <label htmlFor="bio" className="form-label">Über mich</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="form-textarea"
                      placeholder="Einige Worte über sich..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="btn btn-outline"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="loading-spinner w-4 h-4 mr-2"></div>
                          Speichern...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="w-4 h-4 mr-2" />
                          Speichern
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="card">
                <div className="card-body">
                  <h3 className="font-medium text-gray-900 mb-4">Konto-Statistiken</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mitglied seit</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user ? new Date().toLocaleDateString('de-DE') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="status-badge status-active">Aktiv</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Letzter Login</span>
                      <span className="text-sm font-medium text-gray-900">Heute</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-body">
                  <h3 className="font-medium text-gray-900 mb-4">Schnellaktionen</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportData}
                      className="w-full btn btn-outline text-left"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Daten exportieren
                    </button>
                    <button
                      onClick={() => alert('Passwort-Reset würde hier implementiert werden')}
                      className="w-full btn btn-outline text-left"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Passwort ändern
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Benachrichtigungseinstellungen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">E-Mail-Benachrichtigungen</h4>
                    <p className="text-sm text-gray-600">Erhalten Sie Updates per E-Mail</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Push-Benachrichtigungen</h4>
                    <p className="text-sm text-gray-600">Erhalten Sie Push-Benachrichtigungen auf Ihrem Gerät</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sicherheit</h3>
              <div className="space-y-4">
                <button
                  onClick={() => alert('Passwort-Reset würde hier implementiert werden')}
                  className="w-full btn btn-outline text-left"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Passwort ändern
                </button>
                
                <button
                  onClick={() => alert('2FA-Einrichtung würde hier implementiert werden')}
                  className="w-full btn btn-outline text-left"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Zwei-Faktor-Authentifizierung einrichten
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'app' && (
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4">App-Einstellungen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Offline-Modus</h4>
                    <p className="text-sm text-gray-600">App auch ohne Internetverbindung nutzbar</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Speicher</h4>
                  <button
                    onClick={handleClearCache}
                    className="btn btn-danger text-left"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Lokale Daten löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

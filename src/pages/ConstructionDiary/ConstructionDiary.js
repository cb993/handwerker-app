import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  ArrowLeft, 
  Plus, 
  Camera, 
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Save,
  Trash2,
  Edit,
  Eye,
  Download
} from 'lucide-react';

const ConstructionDiary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getData, saveData, deleteData, savePhoto, getPhotos, isOnline } = useOffline();
  
  const [project, setProject] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: 'sunny',
    temperature: '',
    notes: '',
    activities: '',
    materials: '',
    personnel: '',
    issues: ''
  });

  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const weatherOptions = [
    { value: 'sunny', icon: Sun, label: 'Sonnig', color: 'text-yellow-500' },
    { value: 'cloudy', icon: Cloud, label: 'Bewölkt', color: 'text-gray-500' },
    { value: 'rainy', icon: CloudRain, label: 'Regnerisch', color: 'text-blue-500' },
    { value: 'snowy', icon: CloudSnow, label: 'Schnee', color: 'text-blue-300' },
    { value: 'windy', icon: Wind, label: 'Windig', color: 'text-gray-400' }
  ];

  useEffect(() => {
    loadProject();
    loadEntries();
  }, [id, getData]);

  const loadProject = async () => {
    try {
      const projectData = await getData('projects', id);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const entriesData = await getData('diaryEntries') || [];
      const projectEntries = entriesData.filter(entry => entry.projectId === id);
      // Sort by date descending
      projectEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(projectEntries);
    } catch (error) {
      console.error('Failed to load diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = [];

    for (const file of files) {
      try {
        // Convert to base64 for storage
        const base64 = await fileToBase64(file);
        const photoData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          timestamp: new Date().toISOString()
        };
        newPhotos.push(photoData);
      } catch (error) {
        console.error('Failed to process photo:', error);
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const entryData = {
        ...formData,
        id: editingEntry ? editingEntry.id : `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: id,
        createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save the diary entry
      await saveData('diaryEntries', entryData);

      // Save photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          await savePhoto(photo, entryData.id, 'diary');
        }
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weather: 'sunny',
        temperature: '',
        notes: '',
        activities: '',
        materials: '',
        personnel: '',
        issues: ''
      });
      setPhotos([]);
      setShowCreateForm(false);
      setEditingEntry(null);

      // Reload entries
      await loadEntries();

      alert('Bautagebuch-Eintrag erfolgreich gespeichert!');
    } catch (error) {
      console.error('Failed to save diary entry:', error);
      alert('Fehler beim Speichern des Eintrags');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      weather: entry.weather,
      temperature: entry.temperature || '',
      notes: entry.notes || '',
      activities: entry.activities || '',
      materials: entry.materials || '',
      personnel: entry.personnel || '',
      issues: entry.issues || ''
    });

    // Load photos for this entry
    try {
      const entryPhotos = await getPhotos(entry.id, 'diary');
      setPhotos(entryPhotos);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }

    setShowCreateForm(true);
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Möchten Sie den Eintrag vom ${new Date(entry.date).toLocaleDateString('de-DE')} wirklich löschen?`)) {
      return;
    }

    try {
      await deleteData('diaryEntries', entry.id);
      setEntries(entries.filter(e => e.id !== entry.id));
      alert('Eintrag erfolgreich gelöscht');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Fehler beim Löschen des Eintrags');
    }
  };

  const exportToPDF = async (entry) => {
    // This would generate a PDF in a real implementation
    alert('PDF-Export würde hier implementiert werden');
  };

  const getWeatherIcon = (weather) => {
    const option = weatherOptions.find(opt => opt.value === weather);
    return option ? option.icon : Sun;
  };

  const getWeatherColor = (weather) => {
    const option = weatherOptions.find(opt => opt.value === weather);
    return option ? option.color : 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bautagebuch</h1>
            <p className="text-gray-600">{project?.name || 'Projekt'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Eintrag
        </button>
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="loading-spinner w-4 h-4 text-yellow-600 mr-2"></div>
            <span className="text-yellow-800">
              Sie sind offline. Einträge werden gespeichert und später synchronisiert.
            </span>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              {editingEntry ? 'Eintrag bearbeiten' : 'Neuer Bautagebuch-Eintrag'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Date and Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Datum</label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wetter</label>
                <div className="flex space-x-2">
                  {weatherOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, weather: option.value }))}
                        className={`
                          flex flex-col items-center p-2 border rounded-md transition-colors
                          ${formData.weather === option.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        <Icon className={`w-6 h-6 ${option.color}`} />
                        <span className="text-xs mt-1">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="form-group">
              <label htmlFor="temperature" className="form-label">Temperatur (°C)</label>
              <input
                type="number"
                id="temperature"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                className="form-input"
                placeholder="z.B. 18"
              />
            </div>

            {/* Activities */}
            <div className="form-group">
              <label htmlFor="activities" className="form-label">Durchgeführte Arbeiten</label>
              <textarea
                id="activities"
                value={formData.activities}
                onChange={(e) => setFormData(prev => ({ ...prev, activities: e.target.value }))}
                rows={3}
                className="form-textarea"
                placeholder="Beschreiben Sie die durchgeführten Tätigkeiten..."
              />
            </div>

            {/* Personnel */}
            <div className="form-group">
              <label htmlFor="personnel" className="form-label">Personal anwesend</label>
              <input
                type="text"
                id="personnel"
                value={formData.personnel}
                onChange={(e) => setFormData(prev => ({ ...prev, personnel: e.target.value }))}
                className="form-input"
                placeholder="z.B. 3 Handwerker, 1 Bauleiter"
              />
            </div>

            {/* Materials */}
            <div className="form-group">
              <label htmlFor="materials" className="form-label">Verwendete Materialien</label>
              <textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                rows={2}
                className="form-textarea"
                placeholder="Liste der verwendeten Materialien..."
              />
            </div>

            {/* Issues */}
            <div className="form-group">
              <label htmlFor="issues" className="form-label">Probleme/Hindernisse</label>
              <textarea
                id="issues"
                value={formData.issues}
                onChange={(e) => setFormData(prev => ({ ...prev, issues: e.target.value }))}
                rows={2}
                className="form-textarea"
                placeholder="Beschreiben Sie aufgetretene Probleme..."
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes" className="form-label">Zusätzliche Notizen</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="form-textarea"
                placeholder="Weitere wichtige Informationen..."
              />
            </div>

            {/* Photos */}
            <div className="form-group">
              <label className="form-label">Fotos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <label htmlFor="photos" className="cursor-pointer">
                    <span className="btn btn-outline">Fotos auswählen</span>
                    <input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, GIF bis zu 10MB
                  </p>
                </div>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.data}
                        alt={photo.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEntry(null);
                  setPhotos([]);
                }}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Speichern...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    {editingEntry ? 'Aktualisieren' : 'Speichern'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry) => {
            const WeatherIcon = getWeatherIcon(entry.weather);
            return (
              <div key={entry.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <WeatherIcon className={`w-5 h-5 ${getWeatherColor(entry.weather)}`} />
                      {entry.temperature && (
                        <span className="text-sm text-gray-600">{entry.temperature}°C</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportToPDF(entry)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        title="Als PDF exportieren"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-body space-y-4">
                  {entry.activities && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Durchgeführte Arbeiten</h4>
                      <p className="text-gray-600">{entry.activities}</p>
                    </div>
                  )}

                  {entry.personnel && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Personal</h4>
                      <p className="text-gray-600">{entry.personnel}</p>
                    </div>
                  )}

                  {entry.materials && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Materialien</h4>
                      <p className="text-gray-600">{entry.materials}</p>
                    </div>
                  )}

                  {entry.issues && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Probleme/Hindernisse</h4>
                      <p className="text-gray-600">{entry.issues}</p>
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Zusätzliche Notizen</h4>
                      <p className="text-gray-600">{entry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card">
            <div className="card-body text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Einträge</h3>
              <p className="text-gray-600 mb-4">Beginnen Sie mit der Dokumentation Ihrer Baustelle</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ersten Eintrag erstellen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionDiary;

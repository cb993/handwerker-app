import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Calendar, 
  User,
  Building,
  CheckCircle
} from 'lucide-react';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { saveData, isOnline } = useOffline();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    customer: '',
    startDate: '',
    endDate: '',
    status: 'pending',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Projektname ist erforderlich';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Adresse ist erforderlich';
    }
    
    if (!formData.customer.trim()) {
      newErrors.customer = 'Kunde ist erforderlich';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Enddatum muss nach dem Startdatum liegen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const projectData = {
        ...formData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveData('projects', projectData);
      
      // Show success message
      alert('Projekt erfolgreich erstellt!');
      
      // Navigate to project detail
      navigate(`/projects/${projectData.id}`);
      
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Projekt konnte nicht erstellt werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/projects')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neues Projekt</h1>
          <p className="text-gray-600">Legen Sie ein neues Baustellenprojekt an</p>
        </div>
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="loading-spinner w-4 h-4 text-yellow-600 mr-2"></div>
            <span className="text-yellow-800">
              Sie sind offline. Das Projekt wird gespeichert und später synchronisiert.
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body space-y-6">
          {/* Project Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Projektname *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.name ? 'border-red-300' : ''}`}
                placeholder="z.B. Sanierung Hauptstraße 123"
                required
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Adresse *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.address ? 'border-red-300' : ''}`}
                placeholder="Hauptstraße 123, 12345 Berlin"
                required
              />
            </div>
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          {/* Customer */}
          <div className="form-group">
            <label htmlFor="customer" className="form-label">
              Kunde *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.customer ? 'border-red-300' : ''}`}
                placeholder="Mustermann GmbH"
                required
              />
            </div>
            {errors.customer && <p className="form-error">{errors.customer}</p>}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Startdatum
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                Enddatum
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.endDate ? 'border-red-300' : ''}`}
                  min={formData.startDate}
                />
              </div>
              {errors.endDate && <p className="form-error">{errors.endDate}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Geplant</option>
              <option value="active">Aktiv</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="form-textarea"
              placeholder="Zusätzliche Informationen zum Projekt..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/projects')}
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
                  Projekt erstellen
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="card-body">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Tipps für die Projekteinrichtung</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Geben Sie so viele Details wie möglich ein, um die Organisation zu erleichtern</li>
                <li>• Das Startdatum hilft bei der Planung und Nachverfolgung</li>
                <li>• Sie können alle Projektinformationen später jederzeit bearbeiten</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreate;

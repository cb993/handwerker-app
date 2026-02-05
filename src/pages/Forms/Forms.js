import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Save, 
  Edit, 
  Trash2, 
  Download,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Clock
} from 'lucide-react';

const Forms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getData, saveData, deleteData, savePhoto, getPhotos, isOnline } = useOffline();
  
  const [project, setProject] = useState(null);
  const [forms, setForms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState('');

  const formTypes = [
    {
      id: 'daily_report',
      name: 'Tagesbericht',
      description: 'Täglicher Rapport mit Arbeitszeiten und Aktivitäten',
      fields: ['date', 'employees', 'workHours', 'activities', 'materials', 'issues', 'notes']
    },
    {
      id: 'weekly_report',
      name: 'Wochenbericht',
      description: 'Zusammenfassung der wöchentlichen Arbeiten',
      fields: ['week', 'employees', 'totalHours', 'completedTasks', 'nextWeekPlans', 'issues']
    },
    {
      id: 'defect_report',
      name: 'Mängelbericht',
      description: 'Dokumentation von Mängeln und Problemen',
      fields: ['date', 'location', 'description', 'severity', 'responsible', 'deadline', 'status']
    },
    {
      id: 'material_list',
      name: 'Materialliste',
      description: 'Erfassung von Materialien und Ressourcen',
      fields: ['date', 'materials', 'quantities', 'suppliers', 'costs', 'notes']
    },
    {
      id: 'accident_report',
      name: 'Unfallbericht',
      description: 'Dokumentation von Arbeitsunfällen',
      fields: ['date', 'time', 'location', 'involved', 'description', 'witnesses', 'measures']
    },
    {
      id: 'handover',
      name: 'Übergabeprotokoll',
      description: 'Protokoll zur Übergabe von Arbeiten',
      fields: ['date', 'project', 'client', 'scope', 'defects', 'acceptance', 'signature']
    }
  ];

  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    employees: [],
    workHours: '',
    activities: '',
    materials: '',
    issues: '',
    notes: '',
    week: '',
    totalHours: '',
    completedTasks: '',
    nextWeekPlans: '',
    location: '',
    severity: 'low',
    responsible: '',
    deadline: '',
    status: 'open',
    quantities: '',
    suppliers: '',
    costs: '',
    time: '',
    involved: '',
    witnesses: '',
    measures: '',
    client: '',
    scope: '',
    defects: '',
    acceptance: '',
    signature: ''
  });

  useEffect(() => {
    loadData();
  }, [id, getData]);

  const loadData = async () => {
    try {
      const [projectData, formsData, employeesData] = await Promise.all([
        getData('projects', id),
        getData('forms') || [],
        getData('employees') || []
      ]);

      setProject(projectData);
      setForms(formsData.filter(form => form.projectId === id));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormTypeSelect = (type) => {
    setSelectedFormType(type);
    setFormData(prev => ({ ...prev, type: type.id }));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formType = formTypes.find(t => t.id === formData.type);
      const formDataToSave = {
        ...formData,
        id: editingForm ? editingForm.id : `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: id,
        formName: formType?.name || formData.type,
        createdAt: editingForm ? editingForm.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveData('forms', formDataToSave);

      // Reset form
      setFormData({
        type: '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        employees: [],
        workHours: '',
        activities: '',
        materials: '',
        issues: '',
        notes: '',
        week: '',
        totalHours: '',
        completedTasks: '',
        nextWeekPlans: '',
        location: '',
        severity: 'low',
        responsible: '',
        deadline: '',
        status: 'open',
        quantities: '',
        suppliers: '',
        costs: '',
        time: '',
        involved: '',
        witnesses: '',
        measures: '',
        client: '',
        scope: '',
        defects: '',
        acceptance: '',
        signature: ''
      });
      setShowCreateForm(false);
      setSelectedFormType('');
      setEditingForm(null);

      // Reload forms
      await loadData();

      alert('Formular erfolgreich gespeichert!');
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Fehler beim Speichern des Formulars');
    }
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setFormData(form);
    const formType = formTypes.find(t => t.id === form.type);
    if (formType) {
      setSelectedFormType(formType);
    }
    setShowCreateForm(true);
  };

  const handleDelete = async (form) => {
    if (!confirm(`Möchten Sie das Formular "${form.formName}" wirklich löschen?`)) {
      return;
    }

    try {
      await deleteData('forms', form.id);
      setForms(forms.filter(f => f.id !== form.id));
      alert('Formular erfolgreich gelöscht');
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Fehler beim Löschen des Formulars');
    }
  };

  const exportToPDF = async (form) => {
    // This would generate a PDF in a real implementation
    alert('PDF-Export würde hier implementiert werden');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-active';
      case 'open':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'open':
        return 'Offen';
      default:
        return 'Unbekannt';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return 'Unbekannt';
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Digitale Formulare</h1>
            <p className="text-gray-600">{project?.name || 'Projekt'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neues Formular
        </button>
      </div>

      {/* Form Type Selection */}
      {showCreateForm && !selectedFormType && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Formular-Typ auswählen</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleFormTypeSelect(type)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Creation/Edit */}
      {showCreateForm && selectedFormType && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {editingForm ? 'Formular bearbeiten' : selectedFormType.name}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedFormType('');
                  setEditingForm(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Common fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="form-input"
                  placeholder={selectedFormType.name}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Datum</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Dynamic fields based on form type */}
            {selectedFormType.fields.includes('employees') && (
              <div className="form-group">
                <label className="form-label">Mitarbeiter</label>
                <select
                  multiple
                  value={formData.employees}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleFieldChange('employees', selected);
                  }}
                  className="form-select"
                  size={4}
                >
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedFormType.fields.includes('workHours') && (
              <div className="form-group">
                <label className="form-label">Arbeitsstunden</label>
                <input
                  type="number"
                  value={formData.workHours}
                  onChange={(e) => handleFieldChange('workHours', e.target.value)}
                  className="form-input"
                  placeholder="8"
                  step="0.5"
                />
              </div>
            )}

            {selectedFormType.fields.includes('activities') && (
              <div className="form-group">
                <label className="form-label">Aktivitäten</label>
                <textarea
                  value={formData.activities}
                  onChange={(e) => handleFieldChange('activities', e.target.value)}
                  rows={3}
                  className="form-textarea"
                  placeholder="Beschreibung der durchgeführten Arbeiten..."
                />
              </div>
            )}

            {selectedFormType.fields.includes('materials') && (
              <div className="form-group">
                <label className="form-label">Materialien</label>
                <textarea
                  value={formData.materials}
                  onChange={(e) => handleFieldChange('materials', e.target.value)}
                  rows={2}
                  className="form-textarea"
                  placeholder="Verwendete Materialien..."
                />
              </div>
            )}

            {selectedFormType.fields.includes('issues') && (
              <div className="form-group">
                <label className="form-label">Probleme/Hindernisse</label>
                <textarea
                  value={formData.issues}
                  onChange={(e) => handleFieldChange('issues', e.target.value)}
                  rows={2}
                  className="form-textarea"
                  placeholder="Aufgetretene Probleme..."
                />
              </div>
            )}

            {selectedFormType.fields.includes('severity') && (
              <div className="form-group">
                <label className="form-label">Schweregrad</label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="form-select"
                >
                  <option value="low">Niedrig</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                </select>
              </div>
            )}

            {selectedFormType.fields.includes('status') && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="open">Offen</option>
                  <option value="in_progress">In Bearbeitung</option>
                  <option value="completed">Abgeschlossen</option>
                </select>
              </div>
            )}

            {selectedFormType.fields.includes('notes') && (
              <div className="form-group">
                <label className="form-label">Zusätzliche Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={3}
                  className="form-textarea"
                  placeholder="Weitere Informationen..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedFormType('');
                  setEditingForm(null);
                }}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingForm ? 'Aktualisieren' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Forms List */}
      <div className="space-y-4">
        {forms.length > 0 ? (
          forms.map((form) => (
            <div key={form.id} className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{form.title || form.formName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(form.date).toLocaleDateString('de-DE')}
                        </span>
                        {form.status && (
                          <span className={`status-badge ${getStatusColor(form.status)}`}>
                            {getStatusText(form.status)}
                          </span>
                        )}
                        {form.severity && (
                          <span className={`status-badge ${getSeverityColor(form.severity)}`}>
                            {getSeverityText(form.severity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportToPDF(form)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      title="Als PDF exportieren"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(form)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Bearbeiten"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(form)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {form.description && (
                <div className="card-body">
                  <p className="text-gray-600">{form.description}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card">
            <div className="card-body text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Formulare</h3>
              <p className="text-gray-600 mb-4">Erstellen Sie Ihr erstes digitales Formular</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Formular erstellen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forms;

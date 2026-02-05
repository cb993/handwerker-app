import React, { useState, useEffect } from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  Plus, 
  Search, 
  Users, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  User,
  Building,
  Save,
  X
} from 'lucide-react';

const EmployeeManagement = () => {
  const { getData, saveData, deleteData, isOnline } = useOffline();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'handwerker',
    street: '',
    city: '',
    postalCode: '',
    skills: '',
    hourlyRate: '',
    startDate: ''
  });

  const roles = [
    { value: 'handwerker', label: 'Handwerker' },
    { value: 'bauleiter', label: 'Bauleiter' },
    { value: 'geselle', label: 'Geselle' },
    { value: 'lehrling', label: 'Lehrling' },
    { value: 'azubi', label: 'Auszubildender' },
    { value: 'meister', label: 'Meister' }
  ];

  useEffect(() => {
    loadEmployees();
  }, [getData]);

  useEffect(() => {
    if (editingEmployee) {
      setFormData(editingEmployee);
      setShowCreateForm(true);
    }
  }, [editingEmployee]);

  const loadEmployees = async () => {
    try {
      const employeesData = await getData('employees') || [];
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone?.includes(searchTerm)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const employeeData = {
        ...formData,
        id: editingEmployee ? editingEmployee.id : `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: editingEmployee ? editingEmployee.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveData('employees', employeeData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'handwerker',
        street: '',
        city: '',
        postalCode: '',
        skills: '',
        hourlyRate: '',
        startDate: ''
      });
      setShowCreateForm(false);
      setEditingEmployee(null);
      
      // Reload employees
      await loadEmployees();
      
      alert(editingEmployee ? 'Mitarbeiter erfolgreich aktualisiert!' : 'Mitarbeiter erfolgreich erstellt!');
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Fehler beim Speichern des Mitarbeiters');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
  };

  const handleDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteData('employees', employeeToDelete.id);
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      alert('Mitarbeiter erfolgreich gelöscht');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      alert('Fehler beim Löschen des Mitarbeiters');
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role) => {
    const colors = {
      handwerker: 'bg-blue-100 text-blue-800',
      bauleiter: 'bg-purple-100 text-purple-800',
      geselle: 'bg-green-100 text-green-800',
      lehrling: 'bg-yellow-100 text-yellow-800',
      azubi: 'bg-orange-100 text-orange-800',
      meister: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitarbeiterverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Ihr Team und Mitarbeiterdaten</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Mitarbeiter
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEmployee(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'handwerker',
                    street: '',
                    city: '',
                    postalCode: '',
                    skills: '',
                    hourlyRate: '',
                    startDate: ''
                  });
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name *</label>
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
                    required
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
                <label htmlFor="role" className="form-label">Position *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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

            {/* Work Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="skills" className="form-label">Fähigkeiten</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Maurer, Beton, Fliesen"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hourlyRate" className="form-label">Stundensatz (€)</label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="25.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate" className="form-label">Eintrittsdatum</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEmployee(null);
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
                {editingEmployee ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      {employee.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.name}</h3>
                      <span className={`status-badge ${getRoleColor(employee.role)} mt-1`}>
                        {getRoleLabel(employee.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-body space-y-3">
                {employee.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.email}
                  </div>
                )}

                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.phone}
                  </div>
                )}

                {(employee.street || employee.city) && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      {employee.street && <div>{employee.street}</div>}
                      {employee.postalCode && employee.city && (
                        <div>{employee.postalCode} {employee.city}</div>
                      )}
                    </div>
                  </div>
                )}

                {employee.hourlyRate && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Stundensatz:</span>
                    <span className="ml-2 text-gray-600">€{parseFloat(employee.hourlyRate).toFixed(2)}</span>
                  </div>
                )}

                {employee.skills && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Fähigkeiten:</span>
                    <span className="ml-2 text-gray-600">{employee.skills}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Keine Mitarbeiter gefunden' : 'Noch keine Mitarbeiter'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Versuchen Sie, Ihre Suchkriterien zu ändern' 
                : 'Fügen Sie Ihren ersten Mitarbeiter hinzu'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ersten Mitarbeiter anlegen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && employeeToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mitarbeiter löschen?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Sind Sie sicher, dass Sie den Mitarbeiter "{employeeToDelete.name}" löschen möchten? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 btn btn-danger"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

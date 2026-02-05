import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Clock, 
  User, 
  Calendar,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

const TimeTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getData, saveData, deleteData, isOnline } = useOffline();
  const projectId = searchParams.get('project');
  
  const [timeEntries, setTimeEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state for manual entry
  const [manualEntry, setManualEntry] = useState({
    employeeId: '',
    projectId: projectId || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakTime: '0',
    description: ''
  });

  useEffect(() => {
    loadData();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [getData, projectId]);

  const loadData = async () => {
    try {
      const [entriesData, employeesData, projectsData] = await Promise.all([
        getData('timeEntries') || [],
        getData('employees') || [],
        getData('projects') || []
      ]);

      setTimeEntries(entriesData);
      setEmployees(employeesData);
      setProjects(projectsData);

      // Check for active timer
      const activeEntry = entriesData.find(entry => !entry.endTime);
      if (activeEntry) {
        setActiveTimer(activeEntry);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (employeeId, projectId) => {
    try {
      const timerEntry = {
        id: `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        projectId,
        startTime: new Date().toISOString(),
        endTime: null,
        breakTime: 0,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveData('timeEntries', timerEntry);
      setActiveTimer(timerEntry);
      setTimeEntries([...timeEntries, timerEntry]);
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('Fehler beim Starten der Stoppuhr');
    }
  };

  const pauseTimer = async () => {
    if (!activeTimer) return;

    try {
      const updatedEntry = {
        ...activeTimer,
        endTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveData('timeEntries', updatedEntry);
      setActiveTimer(null);
      
      setTimeEntries(entries.map(entry => 
        entry.id === activeTimer.id ? updatedEntry : entry
      ));
    } catch (error) {
      console.error('Failed to pause timer:', error);
      alert('Fehler beim Pausieren der Stoppuhr');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    try {
      const entryData = {
        ...manualEntry,
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveData('timeEntries', entryData);
      
      // Reset form
      setManualEntry({
        employeeId: '',
        projectId: projectId || '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        breakTime: '0',
        description: ''
      });
      setShowManualEntry(false);
      
      // Reload entries
      await loadData();
      
      alert('Zeiterfassung erfolgreich gespeichert!');
    } catch (error) {
      console.error('Failed to save manual entry:', error);
      alert('Fehler beim Speichern der Zeiterfassung');
    }
  };

  const deleteEntry = async (entryId) => {
    if (!confirm('Möchten Sie diesen Zeiteintrag wirklich löschen?')) {
      return;
    }

    try {
      await deleteData('timeEntries', entryId);
      setTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
      alert('Zeiteintrag erfolgreich gelöscht');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Fehler beim Löschen des Zeiteintrags');
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return '00:00';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unbekannt';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'Unbekannt';
  };

  const exportToCSV = () => {
    // Simple CSV export
    const headers = ['Datum', 'Mitarbeiter', 'Projekt', 'Start', 'Ende', 'Dauer', 'Beschreibung'];
    const rows = timeEntries.map(entry => [
      new Date(entry.startTime).toLocaleDateString('de-DE'),
      getEmployeeName(entry.employeeId),
      getProjectName(entry.projectId),
      new Date(entry.startTime).toLocaleTimeString('de-DE'),
      entry.endTime ? new Date(entry.endTime).toLocaleTimeString('de-DE') : '',
      calculateDuration(entry.startTime, entry.endTime),
      entry.description || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeiterfassung_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">Zeiterfassung</h1>
          <p className="text-gray-600">Erfassen und verwalten Sie Arbeitszeiten</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="btn btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manueller Eintrag
          </button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="card bg-green-50 border-green-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-green-900">Aktive Stoppuhr</h3>
                  <p className="text-green-700">
                    {getEmployeeName(activeTimer.employeeId)} - {getProjectName(activeTimer.projectId)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-mono text-green-900">
                  {calculateDuration(activeTimer.startTime)}
                </div>
                <button
                  onClick={pauseTimer}
                  className="btn btn-danger"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stopp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Timer */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Schnelle Zeiterfassung</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Mitarbeiter</label>
              <select
                value={activeTimer?.employeeId || ''}
                onChange={(e) => {
                  if (!activeTimer && e.target.value) {
                    startTimer(e.target.value, projectId || projects[0]?.id);
                  }
                }}
                className="form-select"
                disabled={!!activeTimer}
              >
                <option value="">Mitarbeiter auswählen</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Projekt</label>
              <select
                value={activeTimer?.projectId || projectId || ''}
                onChange={(e) => {
                  if (activeTimer && e.target.value) {
                    // Update project for active timer
                    const updatedTimer = { ...activeTimer, projectId: e.target.value };
                    saveData('timeEntries', updatedTimer);
                    setActiveTimer(updatedTimer);
                  }
                }}
                className="form-select"
                disabled={!activeTimer}
              >
                <option value="">Projekt auswählen</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {!activeTimer && (
            <div className="mt-4 text-center text-gray-500">
              Wählen Sie einen Mitarbeiter aus, um die Stoppuhr zu starten
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Manueller Zeiteintrag</h3>
          </div>
          <form onSubmit={handleManualSubmit} className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Mitarbeiter *</label>
                <select
                  value={manualEntry.employeeId}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="">Mitarbeiter auswählen</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Projekt *</label>
                <select
                  value={manualEntry.projectId}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, projectId: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="">Projekt auswählen</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Datum *</label>
                <input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pausenzeit (Minuten)</label>
                <input
                  type="number"
                  value={manualEntry.breakTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, breakTime: e.target.value }))}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Startzeit *</label>
                <input
                  type="time"
                  value={manualEntry.startTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Endzeit *</label>
                <input
                  type="time"
                  value={manualEntry.endTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Beschreibung</label>
              <textarea
                value={manualEntry.description}
                onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="form-textarea"
                placeholder="Beschreibung der durchgeführten Arbeiten..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowManualEntry(false)}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Entries List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Zeiteinträge</h3>
        </div>
        <div className="card-body">
          {timeEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mitarbeiter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projekt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dauer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className={entry.endTime ? '' : 'bg-green-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.startTime).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEmployeeName(entry.employeeId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProjectName(entry.projectId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(entry.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          {entry.endTime && (
                            <>
                              <span className="mx-1">-</span>
                              {new Date(entry.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(entry.startTime, entry.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Zeiteinträge</h3>
              <p className="text-gray-600 mb-4">Beginnen Sie mit der Erfassung von Arbeitszeiten</p>
              <button
                onClick={() => setShowManualEntry(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ersten Eintrag erstellen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
